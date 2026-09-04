import type { HttpContext } from '@sidekick-coder/zenith-kit/server'
import { validator, BaseException } from '@sidekick-coder/zenith-kit/shared'
import { migrator } from '@sidekick-coder/zenith-kit/server'

export default async function ({ acl, body }: HttpContext) {
    acl.authorize('fresh', 'Migration')

    const payload = validator.validate(body, v => v.object({
        source: v.optional(v.string()),
        steps: v.optional(v.pipe(v.number(), v.integer())),
    }))

    const results = await migrator.fresh(payload)

    const failed = results.find(r => r.result === 'failed')

    if (failed) {
        throw new BaseException(failed.error?.message ?? 'Fresh migration failed')
    }

    return results
}
