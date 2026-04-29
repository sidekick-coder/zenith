import type { HttpContext } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'
import config from '#server/facades/config.facade.ts'
import modules from '#server/facades/modules.facade.ts'

export default async function({ params, acl, query }: HttpContext) {
    const id = validator.validate(params.moduleId, v => v.string())

    const payload = validator.validate(query, v => v.object({
        include: v.optional(
            v.pipe(
                v.extras.url.array(),
                v.array(v.picklist(['upgrade_info']))
            )
        ),
    }))

    const mod = await modules.findOrFail(id)

    acl.authorize('read', mod)

    if (payload.include?.includes('upgrade_info')) {
        const info = config.get(`modules.${mod.id}`)

        mod.upgrade_info = info || {}
    }

    return mod
}
