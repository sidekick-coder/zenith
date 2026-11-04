import { pluginService  } from '@sidekick-coder/zenith-kit/server'
import type { HttpContext } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'
import server from '#server/facades/server.facade.ts'

export default async function({ params, acl }: HttpContext) {
    acl.authorize('update', 'Plugin')

    const id = validator.validate(params.pluginId, v => v.string())
    const plugin = await pluginService.repository.findByIdOrFail(id)

    plugin.toggle()

    setTimeout(() => server.reload(), 1000)

    return { success: true }
}
