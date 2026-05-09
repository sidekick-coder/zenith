import * as v from 'valibot'
import type { HttpContext } from '#server/contracts/httpContext.contract.ts'
import validator from '#shared/services/validator.service.ts'
import seeder from '#server/facades/seeder.facade.ts'

export default async function ({ acl, query }: HttpContext) {
    acl.authorize('list', 'Seeder')

    const payload = validator.validate(query, v.object({
        source: v.optional(v.string()),
        names: v.optional(v.pipe(v.string(), v.transform(v => v.split(',').map(n => n.trim()).filter(Boolean)))),
    }))

    return seeder.list({
        source: payload.source,
        name: payload.names,
    })
}
