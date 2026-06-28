import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'
import dashboardRepository from '#server/facades/dashboardRepository.ts'
import { loadMetas } from '#server/loaders/loadMetas.ts'
import dashboardMetaRepository from '#server/facades/dashboardMetaRepository.ts'

export default defineHandler(async (ctx) => {
    const id = validator.validate(ctx.params.id, v => v.extras.number())
    const payload = validator.validate(ctx.query, v => v.object({ with: v.optional(v.extras.url.array(v.picklist(['metas']))) }))

    const dashboard = await dashboardRepository.findByIdOrFail(id)

    ctx.acl.authorize('read', 'Dashboard', dashboard)

    if (payload.with?.includes('metas')) {
        await loadMetas(dashboard, {
            findMany: (ids: number[]) => dashboardMetaRepository.findMany({ dashboard_id: ids }),
            entityIdKey: 'id',
            foreignKey: 'dashboard_id',
        })
    }


    return dashboard
})
