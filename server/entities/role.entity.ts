import { Model  } from '#server/mixins/model.mixin.ts'
import type { ModelCreateOptions } from '#server/mixins/model.mixin.ts'
import Permission from '#server/entities/permission.entity.ts'
import PermissionAssignment from '#server/entities/permissionAssignment.entity.ts'
import Base from '#shared/entities/role.entity.ts'
import { composeWith } from '#shared/utils/compose.ts'

export default class Role extends composeWith(Base, Model('roles')) {
    public permissions?: Permission[]

    public async createPermission(data: ModelCreateOptions<'permissions'>['values']) {
        const permission = await Permission.create(data)

        await PermissionAssignment.create({
            permission_id: permission.id,
            assignable_type: 'role',
            assignable_id: String(this.id),
        })

        return permission
    }
}