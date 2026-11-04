import { defineHandler, pluginService  } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'

export default defineHandler(async ({ acl, params }) => {
    const pluginId = validator.validate(params.pluginId, v => v.string())

    const plugin = pluginService.repository.findByIdOrFail(pluginId)

    acl.authorize('read', 'Plugin', plugin)

    return plugin
})
