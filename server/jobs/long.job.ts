import QueueJob from '#server/entities/queueJob.entity.ts'

export default class LongJob extends QueueJob {
    public async handle(_data: any) {
        console.log(`Starting long job ${this.id} in queue ${this.queueId}`)

        await new Promise((resolve) => setTimeout(resolve, 10000))

        console.log(`Completed long job ${this.id} in queue ${this.queueId}`)

    }
}