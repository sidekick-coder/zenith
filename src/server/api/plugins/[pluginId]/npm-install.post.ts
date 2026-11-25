import { pluginService, shell } from '@sidekick-coder/zenith-kit/server'
import type { HttpContext } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'

export default async function({ params, acl }: HttpContext) {
    acl.authorize('update', 'Plugin')

    const id = validator.validate(params.pluginId, v => v.string())

    const plugin = await pluginService.repository.findByIdOrFail(id)

    await shell.command('npm', ['install'], { cwd: plugin.directory, })

    return { success: true }
}
