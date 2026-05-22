import { GitGateway } from '@sidekick-coder/zenith-kit/server'
import type { HttpContext } from '#server/contracts/httpContext.contract.ts'
import validator from '#shared/services/validator.service.ts'
import pluginManager from '#server/facades/pluginManager.ts'

export default async function({ acl, params }: HttpContext) {
    const pluginId = validator.validate(params.pluginId, v => v.string())

    const plugin = pluginManager.findOrFail(pluginId)

    acl.authorize('read', 'Plugin', plugin)

    const gateway = new GitGateway({ cwd: plugin.directory })

    await gateway.run('fetch --all --prune --tags')

    return { success: true, }
}
