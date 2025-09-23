export default class RolePermission {
    public role_id: number
    public permission_id: number

    constructor(data: RolePermission) {
        Object.assign(this, data)
    }
}