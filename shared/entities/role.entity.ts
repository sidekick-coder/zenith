export default class Role {
    public id: number
    public name: string

    constructor(data: Role) {
        Object.assign(this, data)
    }
}