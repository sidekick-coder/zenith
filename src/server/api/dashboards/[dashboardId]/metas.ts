import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import { unflatten, validator } from '@sidekick-coder/zenith-kit/shared'
import dashboardMetaRepository from '#server/facades/dashboardMetaRepository.ts'
import dashboardRepository from '#server/facades/dashboardRepository.ts'
import { loadMetas } from '#server/loaders/loadMetas.ts'

export default defineHandler(async (ctx) => {
    const dashboardId = validator.validate(ctx.params.dashboardId, v => v.extras.number())

    const dashboard = await dashboardRepository.findByIdOrFail(dashboardId)

    ctx.acl.authorize('read', 'Dashboard', dashboard)

    await loadMetas(dashboard, {
        findMany: (ids: number[]) => dashboardMetaRepository.findMany({ dashboard_id: ids }),
        entityIdKey: 'id',
        foreignKey: 'dashboard_id',
    })

    return dashboard.metas
})
