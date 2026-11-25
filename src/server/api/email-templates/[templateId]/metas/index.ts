import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import EmailTemplateMeta from '#server/entities/emailTemplateMeta.entity.ts'
import EmailTemplate from '#server/entities/emailTemplate.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'
import { undeleted } from '#server/queries/index.ts'

export default defineAuthHandler(async ({ params, acl, query }) => {
    const templateId = validator.validate(params.templateId, schemas.query.number)
    const template = await EmailTemplate.findOneOrFail({
        query: q => q.where('id', '=', templateId).where(undeleted)
            .selectAll(),
    })

    acl.authorize('read', template)

    const payload = validator.validate(query, schemas.pagination.schema)

    return EmailTemplateMeta.paginate({
        page: payload.page,
        limit: payload.limit,
        query: q => q.selectAll()
            .where('template_id', '=', templateId)
            .where(undeleted)
            .orderBy('created_at', 'desc'),
    })
})
