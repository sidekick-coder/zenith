import { GitGateway } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'
import type { HttpContext } from '#server/contracts/httpContext.contract.ts'
import pluginManager from '#server/facades/pluginManager.ts'
import config from '#server/facades/config.facade.ts'

export default async function ({ acl, params }: HttpContext) {
    const pluginId = validator.validate(params.pluginId, v => v.string())

    const plugin = pluginManager.findOrFail(pluginId)

    acl.authorize('read', 'Plugin', plugin)

    const channel = config.get(`plugins.registry.${pluginId}.version_channel`, 'commits')

    const gateway = new GitGateway({ cwd: plugin.directory })

    const gitInfo = await gateway.getInfo()

    return {
        channel,
        head: gitInfo.head,
        commit_hash: gitInfo.shortHash,
    }
}
