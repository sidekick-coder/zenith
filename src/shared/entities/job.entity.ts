import { BaseEntity, Timestamp } from '#shared/mixins/index.ts'
import { compose } from '#shared/utils/compose.ts'

export default class Job extends compose(BaseEntity, Timestamp) {
    public id: string
    public queue_id: string
    public status: 'pending' | 'in_progress' | 'completed' | 'failed' = 'pending'
    public data: string | null = null
    public result: string | null = null
    public error: string | null = null
}