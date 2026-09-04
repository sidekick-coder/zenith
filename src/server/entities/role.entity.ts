import { composeWith } from '@sidekick-coder/zenith-kit/shared/utils/compose'
import { Model  } from '#server/mixins/model.mixin.ts'
import type { ModelCreateOptions } from '#server/mixins/model.mixin.ts'
import Permission from '#server/entities/permission.entity.ts'
import PermissionAssignment from '#server/entities/permissionAssignment.entity.ts'
import Base from '#shared/entities/role.entity.ts'
import HasManythroughService from '#server/services/hasManythrough.service.ts'

export default class Role extends composeWith(Base, Model('roles')) {

    public get $permissions() {
        return new HasManythroughService({
            sourceId: String(this.id),
                    
            targetTable: 'permissions',
            targetPrimaryKey: 'id',
        
            pivotTable: 'permissions_assignments',
            pivotTargetKey: 'permission_id',
            pivotSourceKey: 'assignable_id',

            attachPayload: { assignable_type: 'role' }
        })
    }

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

    public static async findByName(name: string) {
        return this.findOne({ query: (qb) => qb.where('name', '=', name) })
    }

    public static async findByNameOrFail(name: string) {
        const role = await this.findByName(name)
        
        if (!role) {
            throw new Error(`Role with name "${name}" not found`)
        }

        return role
    }
}
