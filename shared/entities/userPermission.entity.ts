import { BaseEntity } from '#shared/mixins/baseEntity.mixin.ts'
import { compose } from '#shared/utils/compose.ts'

export default class UserPermission extends compose(BaseEntity) {
    public user_id: number
    public permission_id: number
}