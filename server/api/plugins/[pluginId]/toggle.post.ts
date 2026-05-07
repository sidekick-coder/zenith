import type { HttpContext } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'
import pluginManager from '#server/facades/pluginManager.ts'
import server from '#server/facades/server.facade.ts'

export default async function({ params, acl }: HttpContext) {
    acl.authorize('update', 'Plugin')

    const id = validator.validate(params.pluginId, v => v.string())

    pluginManager.toggle(id)

    setTimeout(() => server.reload(), 1000)

    return { success: true }
}
