import { compose } from '@sidekick-coder/zenith-kit/shared/utils/compose'
import Permission from './permission.entity.ts'
import { BaseEntity } from '#shared/mixins/baseEntity.mixin.ts'

export default class PermissionAssignment extends compose(BaseEntity) {
    public id: number
    public assign_type: string
    public assign_id: string
    public permission_id: number
    public permission?: Permission | null = null
}
