import { validator } from '@sidekick-coder/zenith-kit/shared'
import type { HttpContext } from '#server/contracts/httpContext.contract.ts'
import pluginManager from '#server/facades/pluginManager.ts'

export default async function({ acl, params, query }: HttpContext) {
    const payload = validator.validate(query, v => v.object({
        limit: v.optional(v.pipe(v.string(), v.transform(Number))),
        cursor: v.optional(v.string()),
        branches: v.optional(v.extras.url.array(v.string())),
    }))

    const pluginId = validator.validate(params.pluginId, v => v.string())

    const plugin = pluginManager.findOrFail(pluginId)

    acl.authorize('read', 'Plugin', plugin)


    if (payload.branches) {
        const all = await plugin.branches.list()

        const names = all.map(b => b.name)

        const validBranches = payload.branches
            .filter(b => names.includes(b))

        payload.branches = validBranches
    }

    return await plugin.commits.list(payload)
}
