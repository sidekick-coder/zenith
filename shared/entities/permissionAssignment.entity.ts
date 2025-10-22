import Permission from './permission.entity.ts'
import { BaseEntity } from '#shared/mixins/baseEntity.mixin.ts'
import { compose } from '#shared/utils/compose.ts'

export default class PermissionAssignment extends compose(BaseEntity) {
    public id: number
    public assign_type: string
    public assign_id: string
    public permission_id: number
    public permission?: Permission | null = null
}