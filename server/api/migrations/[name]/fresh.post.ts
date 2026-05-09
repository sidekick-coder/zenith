import type { HttpContext } from '@sidekick-coder/zenith-kit/server'
import { validator, BaseException } from '@sidekick-coder/zenith-kit/shared'
import { migrator } from '@sidekick-coder/zenith-kit/server'

export default async function ({ params, acl }: HttpContext) {
    const name = validator.validate(params.name, v => v.string())

    acl.authorize('fresh', 'Migration')

    const migrations = await migrator.list()

    const migration = migrations.find(m => m.name === name)

    if (!migration) {
        throw new BaseException(`Migration "${name}" not found`, 404)
    }

    const rollback = await migrator.rollbackFile(migration.filename)

    if (rollback.result === 'failed') {
        throw new BaseException(rollback.error?.message ?? 'Rollback failed')
    }

    const result = await migrator.migrateFile(migration.filename)

    if (result.result === 'failed') {
        throw new BaseException(result.error?.message ?? 'Migration failed')
    }

    return result
}
