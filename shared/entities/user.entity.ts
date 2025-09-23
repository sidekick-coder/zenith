export default class User {
    public id: number
    public email: string
    public name: string
    public created_at: string
    public updated_at: string

    constructor(data: User) {
        Object.assign(this, data)
    }
}