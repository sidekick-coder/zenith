type Payload = Partial<Omit<Permission, 'editable' | 'conditions'>> & { conditions?: string | null | Record<string, any> }
export default class Permission {
    public id: number
    public name: string
    public description: string | null = null
    public origin: string
    public subject: string
    public action: string
    public conditions: Record<string, any> | null = null

    constructor(data: Payload) {
        Object.assign(this, data)

        if (this.conditions) {
            this.conditions = typeof data.conditions === 'string' ? JSON.parse(data.conditions) : data.conditions
        }
    }

    public static from(row: Payload) {
        return new Permission(row)
    }

    public get editable() {
        return this.origin === 'custom'
    }
}