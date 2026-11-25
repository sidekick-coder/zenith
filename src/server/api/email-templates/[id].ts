import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import EmailTemplate from '#server/entities/emailTemplate.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'

export default defineAuthHandler(async ({ params, acl, query }) => {
    const id = validator.validate(params.id, schemas.query.number)
    const payload = validator.validate(query, v => v.object({ include: v.optional(v.array(v.picklist(['metas']))), }))
    const template = await EmailTemplate.findOrFail(id)

    acl.authorize('read', template)

    if (payload.include) {
        await EmailTemplate.load(template, payload.include)
    }

    return template
})
