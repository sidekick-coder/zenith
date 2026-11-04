import { GitGateway, pluginService } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'
import type { HttpContext } from '#server/contracts/httpContext.contract.ts'

export default async function ({ acl, params }: HttpContext) {
    const pluginId = validator.validate(params.pluginId, v => v.string())

    const plugin = await pluginService.repository.findByIdOrFail(pluginId)

    acl.authorize('read', 'Plugin', plugin)

    const gateway = new GitGateway({ cwd: plugin.directory })

    const gitInfo = await gateway.getInfo()

    return {
        git_head: gitInfo.head,
        git_commit_hash: gitInfo.shortHash,
    }
}
