import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import { flatten, validator } from '@sidekick-coder/zenith-kit/shared'
import dashboardMetaRepository from '#server/facades/dashboardMetaRepository.ts'
import dashboardRepository from '#server/facades/dashboardRepository.ts'

export default defineHandler(async (ctx) => {
    const dashboardId = validator.validate(ctx.params.dashboardId, v => v.extras.number())
    const payload = validator.validate(ctx.body, v => v.record(v.string(), v.any()))

    const dashboard = await dashboardRepository.findByIdOrFail(dashboardId)

    ctx.acl.authorize('update', 'Dashboard', dashboard)

    await dashboardMetaRepository.deleteMany({ dashboard_id: dashboardId })

    const record = flatten(payload)

    Object.keys(record).forEach(key => {
        if (typeof record[key] === 'number') {
            record[key] = `number:${record[key]}`
        }
    })

    const metas = Object.entries(record).map(([name, value]) => ({
        dashboard_id: dashboardId,
        name,
        value,
    }))

    if (metas.length > 0) {
        await dashboardMetaRepository.createMany(metas)
    }

    return payload
})
