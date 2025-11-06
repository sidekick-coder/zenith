import { randomUUID } from 'crypto'
import logger from '../facades/logger.facade.ts'
import Job from '#server/entities/job.entity.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import { basePath } from '#server/utils/paths.ts'
import { importAll } from '#server/utils/importAll.ts'
import type { Constructor } from '#shared/utils/compose.ts'

export default class QueueService {
    public logger = logger.child({ label: 'queue' })
    public jobs: Job[] = []
    public jobConstructors = new Map<string, typeof Job>()
    public intervalId: NodeJS.Timeout | null = null
    public dirs = [basePath('server', 'jobs')]

    public get started() {
        return this.intervalId !== null
    }

    public async add(key: string, data: any) {
        const job = await Job.create({
            id: randomUUID(),
            queue_id: key,
            status: 'pending',
            data,
        })

        this.logger.info('adding job to queue', { job })
    }

    public async process(payload: Job) {
        const jobConstructor = this.jobConstructors.get(payload.queue_id)

        if (!jobConstructor) {
            this.logger.error(`no job constructor found for queueId ${payload.queue_id}, skipping job ${payload.id}`)
            return
        }

        const job = new jobConstructor() 

        job.id = payload.id
        job.queue_id = payload.queue_id
        job.status = payload.status
        job.data = payload.data
        job.created_at = payload.created_at
        job.updated_at = payload.updated_at

        const [errorData, json] = tryCatch.sync(() => job.data ? JSON.parse(job.data) : {})

        if (errorData) {
            this.logger.error('failed to parse job data', { 
                job,
                error: errorData,
            })
            await Job.updateById(job.id, { 
                status: 'failed',
                error: 'Invalid job data' 
            })
            return
        }

        this.logger.debug('process job', { job })

        await Job.updateById(job.id, { status: 'in_progress' })

        const [error, result] = await tryCatch(() => job.handle(json))

        await Job.updateById(job.id, {
            status: error ? 'failed' : 'completed',
            result: result ? JSON.stringify(result) : null,
            error: error ? JSON.stringify(error) : null,
        })

        if (error) {
            (error as any).job = job
            this.logger.error('job failed', error)
            return
        }

        this.logger.debug('job completed', { 
            job,
            result 
        })
        
    }

    public stop(){
        if (!this.intervalId) {
            return
        }

        clearInterval(this.intervalId)
        this.intervalId = null
        this.logger.info('queue processing stopped')
    }

    public start(){
        if (this.intervalId) {
            return
        }

        this.logger.info('starting queue processing')

        let running = false

        const cb = async () => {
            if (running) return 

            running = true

            const pendingJobs = await Job.list({
                query: q => q.selectAll().where('status', '=', 'pending')
            })

            for await (const job of pendingJobs) {
                await this.process(job)
            }

            running = false

        }

        this.intervalId = setInterval(cb, 5000)
    }

    public async load(){
        this.jobs = [] // reset jobs

        // load constructors
        const constructors = {} as Record<string, any>

        for await (const dir of this.dirs) {
            const files = await importAll(dir)

            Object.assign(constructors, files)
        }

        for (const [filename, mod] of Object.entries(constructors)) {
            const constructor = mod.default as Constructor<typeof Job> & { queueId?: string }

            let queueId = 'default'

            if (constructor.name) {
                queueId = constructor.name
            }

            if (constructor.queueId) {
                queueId = constructor.queueId
            }

            this.jobConstructors.set(queueId, constructor as any)

            this.logger.debug('registered job constructor', { 
                filename, 
                queueId 
            })
        }

        const [error, all] = await tryCatch(async () => await Job.list({
            query: q => q.selectAll().where('status', '=', 'pending')
        }))

        if (error) {
            this.logger.info('failed to load pending jobs skipping start')
            this.logger.debug(error)
            return
        }

        for (const j of all) {
            const jobConstructor = this.jobConstructors.get(j.queue_id)

            if (!jobConstructor) {
                this.logger.warn(`no job constructor found for queueId ${j.queue_id}, skipping job ${j.id}`)
                return
            }

        }

        this.logger.info(`loaded ${all.length} pending jobs`)
    }

    public async loadAndStart() {
        await this.load()

        this.start()
    }
}
