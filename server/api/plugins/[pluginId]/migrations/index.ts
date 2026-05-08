import type { HttpContext } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'
import { migrator } from '@sidekick-coder/zenith-kit/server'
import pluginManager from '#server/facades/pluginManager.ts'

export default async function ({ params, acl }: HttpContext) {
    const pluginId = validator.validate(params.pluginId, v => v.string())

    const plugin = pluginManager.findByIdOrFail(pluginId)

    acl.authorize('list', plugin)

    const migrations = await migrator.list({ source: plugin.id })

    return migrations.map(m => ({
        name: m.name,
        source: m.source,
        filename: m.filename,
        status: m.executedAt ? 'executed' : 'pending',
        executedAt: m.executedAt,
    }))
}
