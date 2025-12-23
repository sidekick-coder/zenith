import { randomUUID } from 'crypto'
import logger from '../facades/logger.facade.ts'
import Job from '#server/entities/job.entity.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import { basePath } from '#server/utils/paths.ts'
import { importAll } from '#server/utils/importAll.ts'
import type { Constructor } from '#shared/utils/compose.ts'
import LoggerService from '#shared/services/logger.service.ts'

export default class QueueService {
    public jobs: Job[] = []
    public jobConstructors = new Map<string, typeof Job>()
    public intervalId: NodeJS.Timeout | null = null
    public dirs = [basePath('server', 'jobs')]
    public logger: LoggerService
    public debug = false

    constructor(data: Partial<QueueService> = {}) {
        this.logger = data.logger || new LoggerService()
        this.debug = data.debug || false

        if (this.debug) {
            this.logger.debug('initialized in debug mode')
        }
    }

    public get started() {
        return this.intervalId !== null
    }

    public addDir(dir: string) {
        if (this.dirs.includes(dir)) {
            return
        }
        
        this.dirs.push(dir)
    }

    public async add(key: string, data: any) {
        const job = await Job.create({
            id: randomUUID(),
            queue_id: key,
            status: 'pending',
            data,
        })

        if (this.debug) {
            this.logger.debug('add job', { job })
        }

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

            Object.assign(errorData, { job_id: job.id })
            
            this.logger.error('failed to parse job data', errorData)

            await Job.updateById(job.id, { 
                status: 'failed',
                error: 'Invalid job data' 
            })
            return
        }

        if (this.debug) {
            this.logger.debug('job started', { job })
        }


        await Job.updateById(job.id, { status: 'in_progress' })

        const [error, result] = await tryCatch(() => job.handle(json))

        job.status = error ? 'failed' : 'completed'
        job.result = result ? JSON.stringify(result) : null
        job.error = error ? JSON.stringify(error) : null

        await Job.updateById(job.id, {
            status: job.status,
            result: job.result,
            error: job.error,
        })

        if (error) {
            (error as any).job = job
            this.logger.error('job failed', error)
            return
        }

        this.logger.info('job completed', { 
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
        
        this.logger.info('service stopped')
    }

    public start(){
        if (this.intervalId) {
            return
        }

        this.logger.info('started', {
            jobs: this.jobConstructors.size
        })

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

            if (this.debug) {
                this.logger.debug('register job', { 
                    filename, 
                    queueId 
                })
            }

        }

        const [error, all] = await tryCatch(async () => await Job.list({
            query: q => q.selectAll().where('status', '=', 'pending')
        }))

        if (error) {
            this.logger.error('failed to load pending jobs skipping start', error)
            return
        }

        for (const j of all) {
            const jobConstructor = this.jobConstructors.get(j.queue_id)

            if (!jobConstructor) {
                this.logger.warn(`no job constructor found for queueId ${j.queue_id}, skipping job ${j.id}`)
                return
            }

        }

        if (this.debug) {
            this.logger.debug(`loaded ${all.length} pending jobs`)
        }

    }

    public async loadAndStart() {
        await this.load()

        this.start()
    }
}
