import dashboardRepository from '#server/facades/dashboardRepository.ts'
import { dashboardSchema } from '#shared/schemas/dashboardSchema.ts'
import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'

export default defineHandler(async (ctx) => {
    const id = validator.validate(ctx.params.id, v => v.extras.number())
    const payload = validator.validate(ctx.body, dashboardSchema.update)

    const dashboard = await dashboardRepository.findByIdOrFail(id)

    ctx.acl.authorize('update', 'Dashboard', dashboard)

    await dashboardRepository.updateById(id, payload)

    return dashboardRepository.findByIdOrFail(id)
})
