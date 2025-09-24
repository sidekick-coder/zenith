import { list } from '#server/queries/list.ts'
import Permission from '#shared/entities/permission.entity.ts'
import BaseRole from '#shared/entities/role.entity.ts'

export default class Role extends BaseRole {
    public permissions?: Permission[]

    public async addPermission(permission: Permission){

    }
}