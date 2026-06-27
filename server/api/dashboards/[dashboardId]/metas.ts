import dashboardMetaRepository from '#server/facades/dashboardMetaRepository.ts'
import dashboardRepository from '#server/facades/dashboardRepository.ts'
import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import { unflatten, validator } from '@sidekick-coder/zenith-kit/shared'

export default defineHandler(async (ctx) => {
    const dashboardId = validator.validate(ctx.params.dashboardId, v => v.extras.number())

    const dashboard = await dashboardRepository.findByIdOrFail(dashboardId)

    ctx.acl.authorize('read', 'Dashboard', dashboard)

    const metas = await dashboardMetaRepository.findMany({ dashboard_id: dashboardId })

    const record = Object.fromEntries(metas.map(meta => [meta.name, JSON.parse(meta.value ?? 'null')]))

    return unflatten(record)
})
