import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'
import webhookSenderRepository from '#server/facades/webhookSenderRepository.ts'
import webhookSenderManager from '#server/facades/webhookSenderManager.ts'

export default defineHandler(async (ctx) => {
    const id = validator.validate(ctx.params.id, v => v.string())

    const sender = await webhookSenderRepository.findByIdOrFail(id)

    ctx.acl.authorize('update', 'WebhookSender', sender)

    const enabled = !sender.enabled

    await webhookSenderRepository.updateById(id, { enabled })

    console.log(webhookSenderManager)

    if (enabled) {
        await webhookSenderManager.loadWebhookSender(sender)
    }

    if (!enabled) {
        await webhookSenderManager.unloadWebhookSender(sender)
    }


})
