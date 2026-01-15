import UserMeta from './userMeta.entity.ts'
import { Model } from '#server/mixins/model.mixin.ts'
import { list } from '#server/queries/list.ts'
import Permission from '#shared/entities/permission.entity.ts'
import Role from '#server/entities/role.entity.ts'
import BaseUser from '#shared/entities/user.entity.ts'
import { composeWith } from '#shared/utils/compose.ts'
import { HooksStatic } from '#server/mixins/hooks.mixin.ts'
import hasher from '#server/facades/hasher.facade.ts'
import { firstOrCreate } from '#server/queries/firstOrCreate.ts'
import { Metadata } from '#server/mixins/metadata.mixin.ts'
import MetadataService from '#server/services/metadata.service.ts'
import validator from '#shared/services/validator.service.ts'
import BaseException from '#server/exceptions/base.ts'
import emmitter from '#server/facades/emmitter.facade.ts'
import { undeleted } from '#server/queries/softDelete.ts'

export default class User extends composeWith(
    BaseUser,
    HooksStatic,
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

    public static async beforeSave(user: Partial<User>) {
        if (user.username) {
            // prevent usernames with special characters and/or like email addresses
            const usernameIsValid = validator.isValid(user.username, v => v.pipe(
                v.string(),
                v.regex(/^[a-zA-Z0-9_]+$/)
            ))
    
            if (!usernameIsValid) {
                throw new BaseException('Username can only contain letters, numbers, and underscores', 400)
            }
        }
            
        if (user.password) {
            user.password = await hasher.hash(user.password)
        }
    }

    public static async afterCreate(user: User) {
        emmitter.emit('user:after-create', { user })
    }

    public static boot(){
        this.on('beforeCreate', this.beforeSave)

        this.on('beforeUpdate', this.beforeSave)

        this.on('afterCreate', this.afterCreate)
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

    public static async findByEmail(email: string) {
        return await this.findOne({
            where: eb => eb.and([
                eb('email', '=', email),
                undeleted(eb)
            ])
        })
    }

    public static async findByUUID(uuid: string) {
        return await this.findOne({
            where: eb => eb.and([
                eb.or([
                    eb('email', '=', uuid),
                    eb('username', '=', uuid),
                ]),
                undeleted(eb)
            ])
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
            select: q => q.selectAll()
                .where('user_id', '=', this.id)
                .where('role_id', '=', role.id),
            values: {
                user_id: this.id,
                role_id: role.id
            }
        })
    }

    public toJSON() {
        const json = JSON.parse(JSON.stringify({
            id: this.id,
            username: this.username,
            email: this.email,
            name: this.name,
            created_at: this.created_at,
            updated_at: this.updated_at,
            roles: this.roles,
            permissions: this.permissions,
        }))

        delete json.password

        return json
    }

}