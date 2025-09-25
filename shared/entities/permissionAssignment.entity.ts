import Permission from './permission.entity.ts'

export default class PermissionAssignment {
    public id: number
    public assign_type: string
    public assign_id: string
    public permission_id: number
    public permission?: Permission | null = null

    constructor(data: Partial<PermissionAssignment>) {
        Object.assign(this, data)

        if (data.permission) {
            this.permission = new Permission(data.permission)
        }
    }

    public static from(row: PermissionAssignment) {
        return new PermissionAssignment(row)
    }
}