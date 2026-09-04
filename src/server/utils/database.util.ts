export const metaValue = {
    async fromDb(value: string | null) {
        return value
    },
    async toDb(value: string | null) {
        return value || ''
    }
}