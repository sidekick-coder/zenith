import Handlebars from 'handlebars'
import { format } from 'date-fns'
import { compose } from '@sidekick-coder/zenith-kit/shared/utils/compose'
import { BaseEntity, SoftDelete, Timestamp } from '#shared/mixins/index.ts'

Handlebars.registerHelper('t', function(key: string, options: any) {
    const args: Record<string, any> = {}

    Object.entries(options.hash).forEach(([k, v]) => {
        args[k] = v
    })

    return $t(key, args)
})

Handlebars.registerHelper('date', function(date: Date, pattern: string) {
    if (pattern === 'year') {
        return format(date, 'yyyy')
    }

    return format(date, pattern)
})

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
        const finalContext = {
            _today: new Date(),
            ...context
        }

        const compiled = Handlebars.compile(payload)

        return compiled(finalContext)
    }
}
