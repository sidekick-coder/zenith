import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import EmailTemplateMeta from '#server/entities/emailTemplateMeta.entity.ts'
import EmailTemplate from '#server/entities/emailTemplate.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'
import { undeleted } from '#server/queries/index.ts'

export default defineAuthHandler(async ({ params, acl }) => {
    const templateId = validator.validate(params.templateId, schemas.query.number)
    const metaId = validator.validate(params.id, schemas.query.number)
    const template = await EmailTemplate.findOneOrFail({
        query: q => q.where('id', '=', templateId).where(undeleted)
            .selectAll(),
    })

    acl.authorize('update', template)

    const templateMeta = await EmailTemplateMeta.findOneOrFail({
        query: q => q.where('id', '=', metaId)
            .where('template_id', '=', templateId)
            .where(undeleted)
            .selectAll(),
    })

    await templateMeta.softDelete()

    return templateMeta
})
