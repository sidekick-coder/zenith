import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import EmailTemplate from '#server/entities/emailTemplate.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'

export default defineAuthHandler(async ({ params, body, acl }) => {
    const id = validator.validate(params.id, schemas.query.number)
    const payload = validator.validate(body, schemas.emailTemplate.update)
    const template = await EmailTemplate.findOrFail(id)

    acl.authorize('update', template)
    await EmailTemplate.updateById(id, payload)
    template.merge(payload)

    return template
})
