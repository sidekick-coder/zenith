import ConfigRepository from '@sidekick-coder/zenith-kit/server/repositories/ConfigRepository'
import type ConfigService from '@sidekick-coder/zenith-kit/shared/services/ConfigService'
import type { WebhookSender } from '#shared/schemas/webhookSenderSchema.ts'

export class WebhookSenderRepository extends ConfigRepository<WebhookSender> {
    constructor(config: ConfigService) {
        super(config, 'webhooks.senders', 'id')
    }
}
