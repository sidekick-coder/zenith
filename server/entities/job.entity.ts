import queue from '#server/facades/queue.facade.ts'
import { composeWith } from '#shared/utils/compose.ts'
import Base from '#shared/entities/job.entity.ts'
import { Model } from '#server/mixins/model.mixin.ts'

export default class Job extends composeWith(Base, Model('jobs')) {
    public async handle(_data: any): Promise<any> {
        throw new Error('Method not implemented.')
    }

    public static async dispatch(data: any) {
        const constructor = this as typeof Job & { queueId?: string }

        let queueId = 'default'

        if (constructor.name) {
            queueId = constructor.name
        }

        if (constructor.queueId) {
            queueId = constructor.queueId
        }

        const job = await queue.add(queueId, data)

        return job
    }
}