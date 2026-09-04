import { BaseEntity } from '#shared/mixins/baseEntity.mixin.ts'
import { compose } from '#shared/utils/compose.ts'

export default class UserRole extends compose(BaseEntity) {
    public id: number
    public user_id: number
    public role_id: number
}