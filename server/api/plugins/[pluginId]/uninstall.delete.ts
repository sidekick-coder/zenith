import path from 'path'
import fs from 'fs'
import { basePath, config  } from '@sidekick-coder/zenith-kit/server'
import type { HttpContext } from '@sidekick-coder/zenith-kit/server'
import { BaseException, validator } from '@sidekick-coder/zenith-kit/shared'
import pluginManager from '#server/facades/pluginManager.ts'
import server from '#server/facades/server.facade.ts'

export default function ({ acl, params }: HttpContext) {
    const pluginId = validator.validate(params.pluginId, v => v.string())

    const plugin = pluginManager.findOrFail(pluginId)

    acl.authorize('uninstall', 'Plugin', plugin)

    if (plugin.enabled) {
        throw new BaseException('Plugin must be disabled before uninstalling', 400)
    }

    const dir = plugin.makePath()
    const dirname = path.dirname(dir)

    if (dirname !== basePath('plugins')) {
        throw new BaseException('Plugin not installed via the plugins directory cannot be uninstalled', 400)
    }

    fs.rmSync(dir, {
        recursive: true,
        force: true 
    })

    config.unset(`plugins.registry.${pluginId}`)

    setTimeout(() => server.reload(), 2000)

    return plugin
}
