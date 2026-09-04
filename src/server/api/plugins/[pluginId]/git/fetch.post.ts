import { config, GitGateway  } from '@sidekick-coder/zenith-kit/server'
import type { GitGatewayOptions } from '@sidekick-coder/zenith-kit/server'
import type { HttpContext } from '#server/contracts/httpContext.contract.ts'
import validator from '#shared/services/validator.service.ts'
import pluginManager from '#server/facades/pluginManager.ts'

export default async function({ acl, params }: HttpContext) {
    const pluginId = validator.validate(params.pluginId, v => v.string())

    const plugin = pluginManager.findOrFail(pluginId)

    acl.authorize('read', 'Plugin', plugin)

    const options: GitGatewayOptions = { cwd: plugin.directory, }

    const pluginEntry = config.get(`plugins.registry.${pluginId}`)

    if (pluginEntry?.ssh_key) {
        options.sshKey = pluginEntry.ssh_key
    }

    if (pluginEntry?.ssh_key_file) {
        options.sshKeyFile = pluginEntry.ssh_key_file
    }

    const gateway = new GitGateway(options)

    await gateway.run('fetch --all --prune --tags')

    return { success: true, }
}
