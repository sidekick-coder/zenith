import dashboardMetaRepository from '#server/facades/dashboardMetaRepository.ts'
import dashboardRepository from '#server/facades/dashboardRepository.ts'
import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import { flatten, validator } from '@sidekick-coder/zenith-kit/shared'

export default defineHandler(async (ctx) => {
    const dashboardId = validator.validate(ctx.params.dashboardId, v => v.extras.number())
    const payload = validator.validate(ctx.body, v => v.record(v.string(), v.any()))

    const dashboard = await dashboardRepository.findByIdOrFail(dashboardId)

    ctx.acl.authorize('update', 'Dashboard', dashboard)

    await dashboardMetaRepository.deleteMany({ dashboard_id: dashboardId })

    const record = flatten(payload)

    const metas = Object.entries(record).map(([name, value]) => ({
        dashboard_id: dashboardId,
        name,
        value: JSON.stringify(value),
    }))

    await dashboardMetaRepository.createMany(metas)

    return payload
})
