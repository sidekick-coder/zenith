import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import EmailTemplate from '#server/entities/emailTemplate.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'

export default defineAuthHandler(async ({ params, acl }) => {
    const id = validator.validate(params.id, schemas.query.number)
    const template = await EmailTemplate.findOrFail(id)

    acl.authorize('delete', template)
    await template.softDelete()

    return template
})
