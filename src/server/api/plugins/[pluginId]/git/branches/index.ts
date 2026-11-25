import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'
import pluginManager from '#server/facades/pluginManager.ts'

export default defineHandler(async ({ acl, params }) => {
    const pluginId = validator.validate(params.pluginId, v => v.string())

    const plugin = pluginManager.findOrFail(pluginId)

    acl.authorize('read', 'Plugin', plugin)

    return []
})
