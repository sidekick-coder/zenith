import { Model } from '#server/mixins/model.mixin.ts'
import Base from '#shared/entities/userRole.entity.ts'
import { composeWith } from '#shared/utils/compose.ts'

export default class UserRole extends composeWith(
    Base,
    Model('user_roles')
) {

}