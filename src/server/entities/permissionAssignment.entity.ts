import { composeWith } from '@sidekick-coder/zenith-kit/shared/utils/compose'
import { Model } from '#server/mixins/model.mixin.ts'
import Base from '#shared/entities/permissionAssignment.entity.ts'

export default class PermissionAssignment extends composeWith(
    Base,
    Model('permissions_assignments')
) {
    
}
