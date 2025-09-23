export default class UserRole {
    public user_id: number
    public role_id: number

    constructor(data: UserRole) {
        Object.assign(this, data)
    }
}