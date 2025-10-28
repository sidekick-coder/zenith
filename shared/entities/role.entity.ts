import { BaseEntity, SoftDelete, Timestamp } from '../mixins/index.ts'
import { compose } from '#shared/utils/compose.ts'

export default class Role extends compose(BaseEntity, Timestamp, SoftDelete) {
    public id: number
    public name: string
    public description?: string
}