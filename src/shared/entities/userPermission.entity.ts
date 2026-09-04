import { compose } from '@sidekick-coder/zenith-kit/shared/utils/compose'
import { BaseEntity } from '#shared/mixins/baseEntity.mixin.ts'

export default class UserPermission extends compose(BaseEntity) {
    public user_id: number
    public permission_id: number
}
