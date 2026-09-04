import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'
import { dashboardSchema } from '@sidekick-coder/zenith-kit/shared'
import dashboardRepository from '#server/facades/dashboardRepository.ts'

export default defineHandler(async (ctx) => {
    const payload = validator.validate(ctx.body, dashboardSchema.create)

    ctx.acl.authorize('create', 'Dashboard')

    return dashboardRepository.create(payload)
})
