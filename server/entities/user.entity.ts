import UserMeta from './userMeta.entity.ts'
import { Model } from '#server/mixins/model.mixin.ts'
import { list } from '#server/queries/list.ts'
import Permission from '#shared/entities/permission.entity.ts'
import Role from '#server/entities/role.entity.ts'
import BaseUser from '#shared/entities/user.entity.ts'
import { composeWith } from '#shared/utils/compose.ts'
import { Hooks } from '#server/mixins/hooks.mixin.ts'
import hasher from '#server/facades/hasher.facade.ts'
import { firstOrCreate } from '#server/queries/firstOrCreate.ts'
import { Metadata } from '#server/mixins/metadata.mixin.ts'
import MetadataService from '#server/services/metadata.service.ts'

export default class User extends composeWith(
    BaseUser,
    Hooks,
    Model('users'),
    Metadata('user_metas', 'user_id')
) {

    public get $metas(){
        return new MetadataService({
            foreignKey: 'user_id',
            table: 'user_metas',
            id: this.id
        })
    }

    public static boot(){
        this.on('beforeInsert', async (user: User) => {
            if (user.password) {
                user.password = await hasher.hash(user.password)
            }
        })

        this.on('beforeUpdate', async (user: User) => {
            if (user.password) {
                user.password = await hasher.hash(user.password)
            }
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

    public async getMeta<T = any>(name: string, defaultValue?: T): Promise<T> {
        const meta = await UserMeta.findOne({
            where: (qb) => qb.and([
                qb('user_id', '=', this.id),
                qb('name', '=', name),
            ])
        })

        if (meta?.value?.startsWith('json:')) {
            return JSON.parse(meta.value.substring(5)) as T
        }

        return (meta ? meta.value : defaultValue) as T
    }

    public async setMeta(name: string, value: any): Promise<UserMeta> {
        const meta = await UserMeta.findOne({
            where: (qb) => qb.and([
                qb('user_id', '=', this.id),
                qb('name', '=', name),
            ])
        })

        if (meta) {
            await UserMeta.updateById(meta.id, { value })

            meta.value = value
            
            return meta
        }

        
        return await UserMeta.create({
            user_id: this.id,
            name,
            value
        })
    }

    public async addRole(role: Role) {
        await firstOrCreate('user_roles', {
            select: q => q.where('user_id', '=', this.id).where('role_id', '=', role.id),
            values: {
                user_id: this.id,
                role_id: role.id
            }
        })
    }

}