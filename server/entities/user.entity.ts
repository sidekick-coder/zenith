import { Model } from '#server/mixins/model.mixin.ts'
import { list } from '#server/queries/list.ts'
import Permission from '#shared/entities/permission.entity.ts'
import Role from '#server/entities/role.entity.ts'
import BaseUser from '#shared/entities/user.entity.ts'
import { composeWith } from '#shared/utils/compose.ts'
import { Hooks } from '#server/mixins/hooks.mixin.ts'
import hasher from '#server/facades/hasher.facade.ts'

export default class User extends composeWith(BaseUser, Hooks, Model('users')) {

    public static boot(){
        this.on('beforeInsert', async (user: User) => {
            if (user.password) {
                user.password = await hasher.hash(user.password)
            }
        })

        this.on('beforeUpdate', async (user: User) => {
            console.log('User beforeUpdate hook', user.password)
            if (user.password) {
                user.password = await hasher.hash(user.password)
            }

            console.log('User after processing password', user.password)


        })
    }

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

    public async loadPermissions(){

        if (!this.id) return

        if (!this.roles) {
            await this.loadRoles()
        }

        const permissions = await list('permissions', {
            serialize: Permission.from,
            query: (qb) => qb
                .selectAll()
                .where('id', 'in', (eb) =>
                    eb.selectFrom('permissions_assignments')
                        .select('permission_id')
                        .where('assignable_type', '=', 'user')
                        .where('assignable_id', '=', this.id.toString())
                )
        })

        if (this.roles?.length) {
            const rolesPermissions = await list('permissions', {
                serialize: Permission.from,
                query: (qb) => qb
                    .selectAll()
                    .where('id', 'in', (eb) =>
                        eb.selectFrom('permissions_assignments')
                            .select('permission_id')
                            .where('assignable_type', '=', 'role')
                            .where('assignable_id', 'in', this.roles?.map(r => r.id.toString()) || [])
                    )
            })

            permissions.push(...rolesPermissions)
        }


        this.permissions = permissions
    }

    public static async findByUUID(uuid: string) {
        return await this.findOne({
            query: q => q.where((eb) => eb.or([
                eb('email', '=', uuid),
                eb('username', '=', uuid),
            ]))
        })
    }

}