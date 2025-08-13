import Meta from '#shared/entities/meta.entity.ts'

export default class ServerMeta extends Meta {
    public async toDb() {
        return {
            name: this.name,
            value: this.value
        }
    }

    public static async fromDb(row: any) {
        const meta = new ServerMeta({
            name: row.name,
            value: row.value
        })

        return meta
    }

    public static parseValue(raw: string | null) {
        if (raw === null) return null

        return raw
    }
}