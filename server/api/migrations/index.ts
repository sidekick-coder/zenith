import type { HttpContext } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'
import { migrator } from '@sidekick-coder/zenith-kit/server'

export default async function ({ acl, query }: HttpContext) {
    acl.authorize('list', 'Migration')

    const payload = validator.validate(query, v => v.object({
        source: v.optional(v.string()),
    }))

    const migrations = await migrator.list({ source: payload.source })

    return migrations.map(m => ({
        name: m.name,
        source: m.source,
        filename: m.filename,
        status: m.executedAt ? 'executed' : 'pending',
        executedAt: m.executedAt,
    }))
}
