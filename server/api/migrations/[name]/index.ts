import type { HttpContext } from '@sidekick-coder/zenith-kit/server'
import { validator, BaseException } from '@sidekick-coder/zenith-kit/shared'
import { migrator } from '@sidekick-coder/zenith-kit/server'

export default async function ({ params, acl }: HttpContext) {
    const name = validator.validate(params.name, v => v.string())

    acl.authorize('list', 'Migration')

    const migrations = await migrator.list()

    const migration = migrations.find(m => m.name === name)

    if (!migration) {
        throw new BaseException(`Migration "${name}" not found`, 404)
    }

    return {
        name: migration.name,
        source: migration.source,
        filename: migration.filename,
        status: migration.executedAt ? 'executed' : 'pending',
        executedAt: migration.executedAt,
    }
}
