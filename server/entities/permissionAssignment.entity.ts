import { Model } from '#server/mixins/model.mixin.ts'
import Base from '#shared/entities/permissionAssignment.entity.ts'
import { composeWith } from '#shared/utils/compose.ts'

export default class PermissionAssignment extends composeWith(
    Base,
    Model('permissions_assignments')
) {
    
}