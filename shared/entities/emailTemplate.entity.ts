import Handlebars from 'handlebars'
import { BaseEntity, SoftDelete, Timestamp } from '#shared/mixins/index.ts'
import { compose } from '#shared/utils/compose.ts'

export default class EmailTemplate extends compose(BaseEntity, Timestamp, SoftDelete) {  
    public id: number
    public name: string
    public key: string
    public engine: string | null
    public subject: string
    public body: string | null

    // dynamic
    public metas?: Record<string, any>

    public static compile(payload: string, context: Record<string, any> = {}): string {
        const compiled = Handlebars.compile(payload)

        return compiled(context)
    }
}
