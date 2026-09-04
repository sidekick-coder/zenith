
import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'
import webhookSenderRepository from '#server/facades/webhookSenderRepository.ts'

export default defineHandler(async (ctx) => {
    const id = validator.validate(ctx.params.id, v => v.string())

    const sender = await webhookSenderRepository.findByIdOrFail(id)

    ctx.acl.authorize('delete', 'WebhookSender', sender)

    return webhookSenderRepository.deleteById(id)
})
