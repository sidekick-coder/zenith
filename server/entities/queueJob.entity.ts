import { randomUUID } from 'crypto'
import queue from '#server/facades/queue.facade.ts'

export default class QueueJob<T = any> {
    public id: string
    public queueId: string
    public status: 'pending' | 'in_progress' | 'completed' | 'failed' = 'pending'
    public data: T | null = null

    constructor(id: string, queueId: string, data: T | null = null) {
        this.id = id
        this.queueId = queueId
        this.data = data
    }

    public async handle(_data: T): Promise<void> {
        throw new Error('Method not implemented.')
    }

    public static async dispatch(data: any) {
        const constructor = this as typeof QueueJob & { queueId?: string }

        let queueId = 'default'

        if (constructor.name) {
            queueId = constructor.name
        }

        if (constructor.queueId) {
            queueId = constructor.queueId
        }

        const id = randomUUID()

        const job = new constructor(id, queueId, data)

        queue.add(job)

        return job
    }
}