import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import EmailTemplateMeta from '#server/entities/emailTemplateMeta.entity.ts'
import EmailTemplate from '#server/entities/emailTemplate.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'
import { undeleted } from '#server/queries/index.ts'

export default defineAuthHandler(async ({ params, body, acl }) => {
    const templateId = validator.validate(params.templateId, schemas.query.number)
    const template = await EmailTemplate.findOneOrFail({
        query: q => q.where('id', '=', templateId).where(undeleted)
            .selectAll(),
    })

    acl.authorize('update', template)

    const payload = validator.validate(body, schemas.fileMeta.create)

    return EmailTemplateMeta.updateOrCreate({
        where: eb => eb.and({
            template_id: templateId,
            name: payload.name,
        }),
        values: {
            template_id: templateId,
            name: payload.name,
            value: String(payload.value),
        },
    })
})
