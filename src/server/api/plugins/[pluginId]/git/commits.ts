import { validator } from '@sidekick-coder/zenith-kit/shared'
import type { HttpContext } from '#server/contracts/httpContext.contract.ts'
import pluginManager from '#server/facades/pluginManager.ts'

export default async function({ acl, params, query }: HttpContext) {
    const payload = validator.validate(query, v => v.object({
        limit: v.optional(v.extras.url.number()),
        offset: v.optional(v.extras.url.number()),
        branch: v.optional(v.string()),
    }))

    const pluginId = validator.validate(params.pluginId, v => v.string())

    const plugin = pluginManager.findOrFail(pluginId)

    acl.authorize('read', 'Plugin', plugin)

    return await plugin.commits.list(payload)
}
