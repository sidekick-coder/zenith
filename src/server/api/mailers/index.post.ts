import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import MailerConfig from '#server/entities/mailerConfig.entity.ts'

export default defineAuthHandler(async ({ acl, body }) => {
    acl.authorize('manage', 'Config', { key: 'mailer.gateways' })

    await MailerConfig.create(body)

    return { message: 'Resource created successfully' }
})
