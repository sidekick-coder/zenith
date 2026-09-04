import type { HttpContext } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'
import pluginManager from '#server/facades/pluginManager.ts'
import server from '#server/facades/server.facade.ts'

export default async function({ params, body, acl }: HttpContext) {

    const id = validator.validate(params.pluginId, v => v.string())

    const payload = validator.validate(body, v => v.object({
        version_channel: v.string(),
        commit_hash: v.string(),
    }))

    const plugin = pluginManager.findOrFail(id)

    acl.authorize('update', 'Plugin', plugin)

    await plugin.commits.checkout(payload.commit_hash)

    plugin.set('version_channel', payload.version_channel)

    setTimeout(() => server.reload(), 1000)

    return { success: true }
}
