import * as v from 'valibot'
import type { HttpContext } from '#server/contracts/httpContext.contract.ts'
import modules from '#server/facades/modules.facade.ts'
import config from '#server/facades/config.facade.ts'
import validator from '#shared/services/validator.service.ts'

export default async function({ acl, params, body }: HttpContext) {
    const mod = await modules.findOrFail(params.moduleId)

    acl.authorize('update', mod)

    const payload = validator.validate(body, v.object({ ssh_key: v.nullable(v.string()), }))

    config.set(`modules.${mod.id}.ssh_key`, payload.ssh_key)

    return { ssh_key: config.get(`modules.${mod.id}.ssh_key`, null), }
}
