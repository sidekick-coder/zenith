import { GitGateway, GitBranchRepository } from '@sidekick-coder/zenith-kit/server'
import type { HttpContext } from '#server/contracts/httpContext.contract.ts'
import modules from '#server/facades/modules.facade.ts'
import validator from '#shared/services/validator.service.ts'

export default async function({ acl, params, body }: HttpContext) {
    const payload = validator.validate(body, v => v.object({
        remote: v.string(),
        branch: v.string(),
        localName: v.optional(v.string()),
    }))

    const mod = await modules.findOrFail(params.moduleId)

    acl.authorize('update', mod)

    const repository = new GitBranchRepository(new GitGateway(mod.directory))

    await repository.fetch({
        remote: payload.remote,
        branch: payload.branch,
        localName: payload.localName,
    })

    return { success: true }
}
