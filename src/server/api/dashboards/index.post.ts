import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'
import { dashboardSchema } from '@sidekick-coder/zenith-kit/shared'
import dashboardRepository from '#server/facades/dashboardRepository.ts'

export default defineHandler(async (ctx) => {
    const { metas, ...payload } = validator.validate(ctx.body, v => v.intersect([
        dashboardSchema.create,
        v.object({ metas: v.optional(v.record(v.string(), v.any())) })

    ]))

    ctx.acl.authorize('create', 'Dashboard')

    const dash = await dashboardRepository.create(payload)

    if (metas) {
        await dashboardRepository.setMetas(dash.id, metas)
    }
})
