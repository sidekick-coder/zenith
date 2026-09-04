import config from '@sidekick-coder/zenith-kit/server/facades/config'
import { WebhookSenderRepository } from '#server/repositories/WebhookSenderRepository.ts'

const webhookSenderRepository = new WebhookSenderRepository(config)

export default webhookSenderRepository
