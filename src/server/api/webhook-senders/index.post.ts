
import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'
import webhookSenderRepository from '#server/facades/webhookSenderRepository.ts'
import { webhookSenderCreateSchema } from '#shared/schemas/webhookSenderSchema.ts'

export default defineHandler(async (ctx) => {
    const payload = validator.validate(ctx.body, webhookSenderCreateSchema)

    ctx.acl.authorize('create', 'WebhookSender', payload)

    return webhookSenderRepository.create(payload)
})
