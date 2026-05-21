import type { HttpContext } from '@sidekick-coder/zenith-kit/server'
import { validator, BaseException } from '@sidekick-coder/zenith-kit/shared'
import { migrator } from '@sidekick-coder/zenith-kit/server'

export default async function ({ acl, body }: HttpContext) {
    acl.authorize('rollback', 'Migration')

    const payload = validator.validate(body, v => v.object({
        name: v.optional(v.extras.url.array(v.string())),
        source: v.optional(v.string()),
        steps: v.optional(v.pipe(v.number(), v.integer())),
    }))

    const results = await migrator.rollback(payload)

    const failed = results.find(r => r.result === 'failed')

    if (failed) {
        throw new BaseException(failed.error?.message ?? 'Rollback failed')
    }

    return results
}
