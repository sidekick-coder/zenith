export default class Role {
    public id: number
    public name: string
    public description?: string
    public editable: boolean

    constructor(data: Partial<Role>) {
        Object.assign(this, data)
    }
}