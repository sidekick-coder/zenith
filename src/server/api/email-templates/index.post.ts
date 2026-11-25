import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import EmailTemplate from '#server/entities/emailTemplate.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'

export default defineAuthHandler(async ({ acl, body }) => {
    acl.authorize('create', 'EmailTemplate')

    const payload = validator.validate(body, schemas.emailTemplate.create)

    return EmailTemplate.create(payload)
})
