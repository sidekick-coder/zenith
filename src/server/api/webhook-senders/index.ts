import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'
import webhookSenderRepository from '#server/facades/webhookSenderRepository.ts'

export default defineHandler(async (ctx) => {
    ctx.acl.authorize('list', 'WebhookSender')

    const payload = validator.validate(ctx.query, v => v.extras.pagination.base())

    return webhookSenderRepository.paginate(payload)
})
