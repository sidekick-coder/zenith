interface PermissionData {
    id: number
    subject: string
    action: string
    conditions: string | Record<string, any>
}
export default class Permission {
    public id: number
    public subject: string
    public action: string
    public conditions: Record<string, any>

    constructor(data: Partial<PermissionData>) {
        Object.assign(this, data)

        this.conditions = typeof data.conditions === 'string' ? JSON.parse(data.conditions) : data.conditions
    }

    public static from(row: Partial<PermissionData>): Permission {
        return new Permission(row)
    }
}