import { defineAuthHandler, config } from '@sidekick-coder/zenith-kit/server'
import MailerConfig from '#server/entities/mailerConfig.entity.ts'
import mailer from '#server/facades/mailer.facade.ts'
import validator from '#shared/services/validator.service.ts'

export default defineAuthHandler(async ({ acl, params }) => {
    const id = validator.validate(params.id, v => v.string())
    const mailerConfig = await MailerConfig.findOrFail(id)

    acl.authorize('update', 'Config', { key: 'mailer.default' })

    config.set('mailer.default', mailerConfig.id)
    mailer.selectedGateway = mailerConfig.id
})
