import { compose } from '@sidekick-coder/zenith-kit/shared/utils/compose'
import { BaseEntity } from '#shared/mixins/baseEntity.mixin.ts'

export default class UserRole extends compose(BaseEntity) {
    public id: number
    public user_id: number
    public role_id: number
}
