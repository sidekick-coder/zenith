import { GitGateway, GitBranchRepository } from '@sidekick-coder/zenith-kit/server'
import type { HttpContext } from '#server/contracts/httpContext.contract.ts'
import modules from '#server/facades/modules.facade.ts'

export default async function({ acl, params }: HttpContext) {
    const mod = await modules.findOrFail(params.moduleId)

    acl.authorize('read', mod)

    const repository = new GitBranchRepository(new GitGateway({ cwd: mod.directory }))

    return await repository.list()
}
