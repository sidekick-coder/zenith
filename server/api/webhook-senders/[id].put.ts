
import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'
import webhookSenderRepository from '#server/facades/webhookSenderRepository.ts'
import { webhookSenderUpdateSchema } from '#shared/schemas/webhookSenderSchema.ts'

export default defineHandler(async (ctx) => {
    const id = validator.validate(ctx.params.id, v => v.string())
    const payload = validator.validate(ctx.body, webhookSenderUpdateSchema)

    const sender = await webhookSenderRepository.findByIdOrFail(id)

    ctx.acl.authorize('update', 'WebhookSender', sender)

    return webhookSenderRepository.updateById(id, payload)
})
