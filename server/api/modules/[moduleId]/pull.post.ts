import type { HttpContext } from '#server/contracts/httpContext.contract.ts'
import modules from '#server/facades/modules.facade.ts'

export default async function({ acl, params }: HttpContext) {
    const mod = await modules.findOrFail(params.moduleId)

    acl.authorize('update', mod)

    await mod.git.pull()

    return { success: true }
}
