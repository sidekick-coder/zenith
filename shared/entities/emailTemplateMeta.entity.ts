import { BaseEntity, SoftDelete, Timestamp } from '#shared/mixins/index.ts'
import { compose } from '#shared/utils/compose.ts'

export default class EmailTemplateMeta extends compose(BaseEntity, Timestamp, SoftDelete) {  
    public id: number
    public template_id: number
    public name: string
    public value: string
}
