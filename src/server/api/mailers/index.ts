import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import MailerConfig from '#server/entities/mailerConfig.entity.ts'

export default defineAuthHandler(async ({ acl }) => {
    acl.authorize('manage', 'Config', { key: 'mailer.gateways' })

    const items = await MailerConfig.list()

    return {
        page: 1,
        total: items.length,
        total_pages: 1,
        items,
    }
})
