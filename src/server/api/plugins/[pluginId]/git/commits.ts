import { validator } from '@sidekick-coder/zenith-kit/shared'
import { pluginService } from '@sidekick-coder/zenith-kit/server'
import type { HttpContext } from '#server/contracts/httpContext.contract.ts'

export default async function({ acl, params, query }: HttpContext) {
    const payload = validator.validate(query, v => v.object({
        limit: v.optional(v.extras.url.number()),
        offset: v.optional(v.extras.url.number()),
        branch: v.optional(v.string()),
    }))

    const pluginId = validator.validate(params.pluginId, v => v.string())

    const plugin = await pluginService.repository.findByIdOrFail(pluginId)

    acl.authorize('read', 'Plugin', plugin)

    return await plugin.commits.list(payload)
}
