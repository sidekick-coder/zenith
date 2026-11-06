import * as v from 'valibot'
import { pluginService } from '@sidekick-coder/zenith-kit/server'
import type { HttpContext } from '#server/contracts/httpContext.contract.ts'

import validator from '#shared/services/validator.service.ts'

export default async function({ acl, params, body }: HttpContext) {
    acl.authorize('update', 'Plugin')

    const pluginId = validator.validate(params.pluginId, v => v.string())

    const payload = validator.validate(body, v.object({ development_mode: v.optional(v.boolean()), }))

    const plugin = await pluginService.repository.findByIdOrFail(pluginId)

    plugin.set('development_mode', payload.development_mode)

    if (payload.development_mode !== undefined) {
        plugin.developmentMode = payload.development_mode
    }


    return { success: true }
}
