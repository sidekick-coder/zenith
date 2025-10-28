import logger from '../facades/logger.facade.ts'
import QueueJob from '#server/entities/queueJob.entity.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

export default class QueueService {
    public logger = logger.child({ label: 'queue' })
    public jobs: QueueJob[] = []
    public intervalId: NodeJS.Timeout | null = null

    public get started() {
        return this.intervalId !== null
    }

    public add(job: QueueJob) {
        this.logger.debug('add job', job)

        this.jobs.push(job)
    }

    public async process(job: QueueJob) {
        this.logger.debug('process job', job)
        job.status = 'in_progress'

        const [error, result] = await tryCatch(() => job.handle(job.data))

        job.status = error ? 'failed' : 'completed'

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

            const pendingJobs = this.jobs.filter(job => job.status === 'pending')
    
            for await (const job of pendingJobs) {
                await this.process(job)
            }

            running = false

        }

        this.intervalId = setInterval(cb, 5000)
    }
}
