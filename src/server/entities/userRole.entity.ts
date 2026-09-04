import { composeWith } from '@sidekick-coder/zenith-kit/shared/utils/compose'
import { Model } from '#server/mixins/model.mixin.ts'
import Base from '#shared/entities/userRole.entity.ts'

export default class UserRole extends composeWith(
    Base,
    Model('user_roles')
) {

}
