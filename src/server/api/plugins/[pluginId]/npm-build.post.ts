import { shell  } from '@sidekick-coder/zenith-kit/server'
import type { HttpContext } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'
import pluginManager from '#server/facades/pluginManager.ts'

export default async function({ params, acl }: HttpContext) {
    acl.authorize('update', 'Plugin')

    const id = validator.validate(params.pluginId, v => v.string())

    const plugin = pluginManager.findOrFail(id)

    await shell.command('npm', ['run', 'build'], { cwd: plugin.directory, })

    return { success: true }
}
