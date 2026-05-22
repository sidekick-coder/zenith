import { validator } from '@sidekick-coder/zenith-kit/shared'
import type { HttpContext } from '#server/contracts/httpContext.contract.ts'
import pluginManager from '#server/facades/pluginManager.ts'
import BaseException from '#server/exceptions/base.ts'

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
        const valid = [] as string[]

        const names = all.map(b => b.name)

        // match all local and remote branches with the requested branches
        for (const requested of payload.branches) {
            const local = names.find(n => n === requested)

            if (local) {
                valid.push(local)
            }

            const remotes = names.filter(n => n.endsWith(`/${requested}`))

            if (remotes.length) {
                valid.push(...remotes)
            }
        }

        payload.branches = valid
    }

    return await plugin.commits.list(payload)
}
