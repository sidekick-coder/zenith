import { GitGateway } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'
import type { HttpContext } from '#server/contracts/httpContext.contract.ts'
import pluginManager from '#server/facades/pluginManager.ts'

export default async function ({ acl, params }: HttpContext) {
    const pluginId = validator.validate(params.pluginId, v => v.string())

    const plugin = pluginManager.findOrFail(pluginId)

    acl.authorize('read', 'Plugin', plugin)

    const gateway = new GitGateway({ cwd: plugin.directory })

    const gitInfo = await gateway.getInfo()

    return {
        git_head: gitInfo.head,
        git_commit_hash: gitInfo.shortHash,
        version_channel: plugin.version_channel,
        version_available_channels: plugin.version_available_channels,
    }
}
