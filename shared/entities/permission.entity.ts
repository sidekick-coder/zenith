import { BaseEntity } from '#shared/mixins/index.ts'
import { compose } from '#shared/utils/compose.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

export default class Permission extends compose(BaseEntity) {
    public id: number
    public name: string
    public description: string | null = null
    public origin: string
    public subject: string
    public action: string
    public conditions: string | null = null

    public get editable() {
        return this.origin === 'custom'
    }

    public get parsedConditions() {
        if (!this.conditions) {
            return {}
        }

        const [error, json] = tryCatch.sync(() => JSON.parse(this.conditions!))

        return error ? {} : json
    }
}