import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import MailerConfig from '#server/entities/mailerConfig.entity.ts'
import validator from '#shared/services/validator.service.ts'

export default defineAuthHandler(async ({ acl, params }) => {
    acl.authorize('manage', 'Config', { key: 'mailer.gateways' })

    const id = validator.validate(params.id, v => v.string())

    return MailerConfig.findOrFail(id)
})
