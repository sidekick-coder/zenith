import { BaseEntity, SoftDelete, Timestamp } from '#shared/mixins/index.ts'
import { compose } from '#shared/utils/compose.ts'

export default class EmailTemplate extends compose(BaseEntity, Timestamp, SoftDelete) {  
    public id: number
    public name: string
    public key: string
    public engine: string | null
    public subject: string
    public body: string

    // dynamic
    public metas?: Record<string, any>
}
