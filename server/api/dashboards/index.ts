import dashboardRepository from '#server/facades/dashboardRepository.ts'
import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'

export default defineHandler(async (ctx) => {
    const payload = validator.validate(ctx.query, v => v.intersect([
        v.extras.pagination(),
        v.object({
            search: v.optional(v.string()),
        })
    ]))

    ctx.acl.authorize('list', 'Dashboard')

    return dashboardRepository.paginate(payload)
})
