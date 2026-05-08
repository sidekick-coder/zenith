import type { HttpContext } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'
import { migrator, BaseException } from '@sidekick-coder/zenith-kit/server'
import pluginManager from '#server/facades/pluginManager.ts'

export default async function ({ params, body, acl }: HttpContext) {
    const pluginId = validator.validate(params.pluginId, v => v.string())

    const plugin = pluginManager.findByIdOrFail(pluginId)

    acl.authorize('migrate', plugin)

    const payload = validator.validate(body, v => v.object({
        steps: v.optional(v.pipe(v.number(), v.integer()), 1),
    }))

    const results = await migrator.up(payload.steps, { source: plugin.id })

    const failed = results.find(r => r.result === 'failed')

    if (failed) {
        throw new BaseException(failed.error?.message ?? 'Migration failed')
    }

    return results
}
