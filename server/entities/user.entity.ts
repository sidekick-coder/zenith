import { create } from '#server/queries/create.ts'
import { list } from '#server/queries/list.ts'
import Permission from '#shared/entities/permission.entity.ts'
import Role from '#shared/entities/role.entity.ts'
import BaseUser from '#shared/entities/user.entity.ts'

export default class User extends BaseUser {
    public roles?: Role[]
    public permissions?: Permission[]

    public async loadRoles(){
        this.roles = await list('roles', {
            serialize: Role.from,
            query: (qb) => qb
                .selectAll()
                .where('id', 'in', (eb) =>
                    eb.selectFrom('user_roles')
                        .select('role_id')
                        .where('user_id', '=', this.id)
                )
        })
    }

    public async addPermission(payload: Omit<Permission, 'id'>){
        const permission = create('permissions', {
            serialize: Permission.from,
            values: {
                ...payload,
                conditions: JSON.stringify(payload.conditions)
            }
        })

        await create('permissions_assignments', {
            values: {
                permission_id: (await permission).id,
                assignable_type: 'user',
                assignable_id: this.id.toString(),
            }
        })
    }

}