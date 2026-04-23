
import { GitCommitRepository } from '@sidekick-coder/zenith-kit/server'
import type { HttpContext } from '#server/contracts/httpContext.contract.ts'
import modules from '#server/facades/modules.facade.ts'
import validator from '#shared/services/validator.service.ts'

export default async function({ acl, params, query }: HttpContext) {
    const payload = validator.validate(query, v => v.object({
        page: v.optional(v.pipe(v.string(), v.transform(Number))),
        perPage: v.optional(v.pipe(v.string(), v.transform(Number)), '10'),
        branch: v.optional(v.string()),
    }))

    const mod = await modules.findOrFail(params.moduleId)

    acl.authorize('read', mod)

    const repository = new GitCommitRepository(mod.git)

    return await repository.list({
        page: payload.page,
        perPage: payload.perPage,
        branch: payload.branch,
    })
}
