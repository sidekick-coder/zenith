import { BaseEntity } from '../mixins/index.ts'
import { compose } from '#shared/utils/compose.ts'

export default class Permission extends compose(BaseEntity) {
    public id: number
    public name: string
    public description: string | null = null
    public origin: string
    public subject: string
    public action: string
    public conditions: Record<string, any> | null = null

    public get editable() {
        return this.origin === 'custom'
    }
}