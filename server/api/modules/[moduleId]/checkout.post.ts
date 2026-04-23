import type { HttpContext } from '#server/contracts/httpContext.contract.ts'
import modules from '#server/facades/modules.facade.ts'
import validator from '#shared/services/validator.service.ts'

export default async function({ acl, params, body }: HttpContext) {
    const payload = validator.validate(body, v => v.object({
        ref: v.pipe(
            v.string(),
            v.regex(/^[0-9A-Za-z._/-]+$/)
        ),
    }))

    const mod = await modules.findOrFail(params.moduleId)

    acl.authorize('update', mod)

    await mod.git.checkout(payload.ref)

    return { success: true }
}
