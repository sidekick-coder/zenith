import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'
import dashboardRepository from '#server/facades/dashboardRepository.ts'
import { loadMetas } from '#server/loaders/loadMetas.ts'
import dashboardMetaRepository from '#server/facades/dashboardMetaRepository.ts'

export default defineHandler(async (ctx) => {
    const payload = validator.validate(ctx.query, v => v.intersect([
        v.extras.pagination(),
        v.object({ 
            search: v.optional(v.string()),
            with: v.optional(v.extras.url.array(v.picklist(['metas'])))
        })
    ]))

    ctx.acl.authorize('list', 'Dashboard', payload)

    const pagination = await dashboardRepository.paginate(payload)

    if (payload.with?.includes('metas')) {
        await loadMetas(pagination.items, {
            findMany: (ids: number[]) => dashboardMetaRepository.findMany({ dashboard_id: ids }),
            entityIdKey: 'id',
            foreignKey: 'dashboard_id',
        })
    }

    return dashboardRepository.paginate(payload)
})
