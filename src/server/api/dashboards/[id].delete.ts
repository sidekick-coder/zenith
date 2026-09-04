import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'
import dashboardRepository from '#server/facades/dashboardRepository.ts'

export default defineHandler(async (ctx) => {
    const id = validator.validate(ctx.params.id, v => v.extras.number())

    const dashboard = await dashboardRepository.findByIdOrFail(id)

    ctx.acl.authorize('delete', 'Dashboard', dashboard)

    await dashboardRepository.softDeleteById(id)

    return { success: true }
})
