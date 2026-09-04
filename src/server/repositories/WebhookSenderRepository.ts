import { ConfigRepository } from '@sidekick-coder/zenith-kit/server'
import type { ConfigService } from '@sidekick-coder/zenith-kit/shared'
import type { WebhookSender } from '#shared/schemas/webhookSenderSchema.ts'

export class WebhookSenderRepository extends ConfigRepository<WebhookSender> {
    constructor(config: ConfigService) {
        super(config, 'webhooks.senders', 'id')
    }
}
