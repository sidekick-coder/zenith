import { container } from '@sidekick-coder/zenith-kit/server'
import WebhookSenderManager from '#server/managers/WebhookSenderManager.ts'

const webhookSenderManager = container.proxy<WebhookSenderManager>(WebhookSenderManager)

export default webhookSenderManager
