import type { HttpContext } from '@sidekick-coder/zenith-kit/server'
import { validator, BaseException } from '@sidekick-coder/zenith-kit/shared'
import { migrator } from '@sidekick-coder/zenith-kit/server'

export default async function ({ acl, body }: HttpContext) {
    acl.authorize('migrate', 'Migration')

    const payload = validator.validate(body, v => v.object({
        source: v.optional(v.string()),
        steps: v.optional(v.pipe(v.number(), v.integer()), 1),
    }))

    const { steps, ...filters } = payload

    const results = await migrator.up(steps, filters)

    const failed = results.find(r => r.result === 'failed')

    if (failed) {
        throw new BaseException(failed.error?.message ?? 'Migration failed')
    }

    return results
}
