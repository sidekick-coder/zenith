import type { HttpContext } from '#server/contracts/httpContext.contract.ts'
import modules from '#server/facades/modules.facade.ts'
import config from '#server/facades/config.facade.ts'

export default async function({ acl, params }: HttpContext) {
    const mod = await modules.findOrFail(params.moduleId)

    acl.authorize('read', mod)

    return { ssh_key: config.get(`modules.${mod.id}.ssh_key`, null), }
}
