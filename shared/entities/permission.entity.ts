export default class Permission {
    public id: number
    public subject: string
    public action: string
    public conditions: Record<string, any>

    constructor(data: Permission) {
        Object.assign(this, data)
    }
}