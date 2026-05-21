import { GitCommitRepository, GitGateway } from '@sidekick-coder/zenith-kit/server'
import type { HttpContext } from '#server/contracts/httpContext.contract.ts'
import validator from '#shared/services/validator.service.ts'
import pluginManager from '#server/facades/pluginManager.ts'

export default async function({ acl, params, query }: HttpContext) {
    const payload = validator.validate(query, v => v.object({
        page: v.optional(v.pipe(v.string(), v.transform(Number))),
        perPage: v.optional(v.pipe(v.string(), v.transform(Number)), '10'),
        branch: v.optional(v.string()),
    }))

    const pluginId = validator.validate(params.pluginId, v => v.string())

    const plugin = pluginManager.findOrFail(pluginId)

    acl.authorize('read', 'Plugin', plugin)

    const gateway = new GitGateway({ cwd: plugin.directory })

    const repository = new GitCommitRepository(gateway)

    return await repository.list({
        page: payload.page,
        perPage: payload.perPage,
        branch: payload.branch,
    })
}
