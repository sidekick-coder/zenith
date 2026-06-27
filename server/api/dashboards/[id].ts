import dashboardRepository from '#server/facades/dashboardRepository.ts'
import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'

export default defineHandler(async (ctx) => {
    const id = validator.validate(ctx.params.id, v => v.extras.number())

    const dashboard = await dashboardRepository.findByIdOrFail(id)

    ctx.acl.authorize('read', 'Dashboard', dashboard)

    return dashboard
})
