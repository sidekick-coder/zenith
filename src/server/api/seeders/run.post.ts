import * as v from 'valibot'
import type { HttpContext } from '#server/contracts/httpContext.contract.ts'
import validator from '#shared/services/validator.service.ts'
import seeder from '#server/facades/seeder.facade.ts'
import BaseException from '#server/exceptions/base.ts'

export default async function ({ acl, body }: HttpContext) {
    acl.authorize('run', 'Seeder')

    const payload = validator.validate(body, v.object({
        source: v.optional(v.string()),
        names: v.optional(v.array(v.string())),
    }))

    const results = await seeder.run({
        source: payload.source,
        name: payload.names,
    })

    const failed = results.find(r => r.result === 'failed')

    if (failed) {
        throw new BaseException(failed.error?.message ?? 'Seeder failed')
    }

    return results
}
