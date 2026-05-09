import type { HttpContext } from '@sidekick-coder/zenith-kit/server'
import { validator, BaseException } from '@sidekick-coder/zenith-kit/shared'
import { migrator } from '@sidekick-coder/zenith-kit/server'

export default async function ({ params, acl }: HttpContext) {
    const name = validator.validate(params.name, v => v.string())

    acl.authorize('rollback', 'Migration')

    const migrations = await migrator.list()

    const migration = migrations.find(m => m.name === name)

    if (!migration) {
        throw new BaseException(`Migration "${name}" not found`, 404)
    }

    const result = await migrator.rollbackFile(migration.filename)

    if (result.result === 'failed') {
        throw new BaseException(result.error?.message ?? 'Rollback failed')
    }

    return result
}
