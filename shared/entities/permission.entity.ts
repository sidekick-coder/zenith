interface PermissionData {
    id: number
    name: string
    subject: string
    action: string
    conditions: string | Record<string, any> | null
}
export default class Permission {
    public id: number
    public name: string
    public subject: string
    public action: string
    public conditions: Record<string, any> | null = null

    constructor(data: Partial<PermissionData>) {
        Object.assign(this, data)

        if (this.conditions) {
            this.conditions = typeof data.conditions === 'string' ? JSON.parse(data.conditions) : data.conditions
        }
    }

    public static from(row: Partial<PermissionData>): Permission {
        return new Permission(row)
    }
}