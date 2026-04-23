import * as v from 'valibot'
import type { HttpContext } from '#server/contracts/httpContext.contract.ts'
import modules from '#server/facades/modules.facade.ts'
import validator from '#shared/services/validator.service.ts'
import server from '#server/facades/server.facade.ts'

export default async function({ acl, body }: HttpContext) {
    acl.authorize('create', 'Module')

    const options = validator.validate(body, v.object({
        id: v.string(),
        repository: v.string(),
        branch: v.optional(v.string()),
        key: v.optional(v.string()),
    }))

    await modules.installer.install(options)

    server.reload()

    return { success: true }
}
