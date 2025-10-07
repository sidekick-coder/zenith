import { Model } from '#server/mixins/model.mixin.ts'
import Permission from '#shared/entities/permission.entity.ts'
import Base from '#shared/entities/role.entity.ts'
import { composeWith } from '#shared/utils/compose.ts'

export default class Role extends composeWith(Base, Model('roles')) {
    public permissions?: Permission[]
}