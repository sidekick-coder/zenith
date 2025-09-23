export default class UserPermission {
    public user_id: number
    public permission_id: number

    constructor(data: UserPermission) {
        Object.assign(this, data)
    }
}