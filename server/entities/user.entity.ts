import { list } from '#server/queries/list.ts'
import Role from '#shared/entities/role.entity.ts'
import BaseUser from '#shared/entities/user.entity.ts'

export default class User extends BaseUser {
    public roles?: Role[]

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

}