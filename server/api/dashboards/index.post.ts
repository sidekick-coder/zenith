import dashboardRepository from '#server/facades/dashboardRepository.ts'
import { dashboardSchema } from '#shared/schemas/dashboardSchema.ts'
import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'

export default defineHandler(async (ctx) => {
    const payload = validator.validate(ctx.body, dashboardSchema.create)

    ctx.acl.authorize('create', 'Dashboard')

    return dashboardRepository.create(payload)
})
