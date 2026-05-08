import type { HttpContext } from '@sidekick-coder/zenith-kit/server'
import { validator, BaseException } from '@sidekick-coder/zenith-kit/shared'
import { migrator } from '@sidekick-coder/zenith-kit/server'
import pluginManager from '#server/facades/pluginManager.ts'

export default async function ({ params, acl }: HttpContext) {
    const pluginId = validator.validate(params.pluginId, v => v.string())
    const name = validator.validate(params.name, v => v.string())

    const plugin = pluginManager.findByIdOrFail(pluginId)

    acl.authorize('rollback', plugin)

    const migrations = await migrator.list({ source: plugin.id })

    const migration = migrations.find(m => m.name === name)

    if (!migration) {
        throw new BaseException(`Migration "${name}" not found for plugin "${plugin.id}"`)
    }

    const result = await migrator.rollbackFile(migration.filename)

    if (result.result === 'failed') {
        throw new BaseException(result.error?.message ?? 'Rollback failed')
    }

    return result
}
