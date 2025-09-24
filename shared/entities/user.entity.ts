export default class User {
    public id: number
    public email: string
    public name: string
    public username: string
    public created_at: string | Date
    public updated_at: string | Date

    constructor(data: User) {
        Object.assign(this, data)
    }
}