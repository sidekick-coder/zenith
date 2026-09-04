import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import EmailTemplateMeta from '#server/entities/emailTemplateMeta.entity.ts'
import EmailTemplate from '#server/entities/emailTemplate.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'
import { undeleted } from '#server/queries/index.ts'

const router = rootRouter.use(authMiddleware)
    .prefix('/api/email-templates/:templateId/metas')
    .group()

router.get('/', async ({ params, acl, query }) => {
    const templateId = validator.validate(params.templateId, schemas.query.number)

    const template = await EmailTemplate.findOneOrFail({
        query: q => q.where('id', '=', templateId)
            .where(undeleted)
            .selectAll()
    })

    acl.authorize('read', template)

    const payload = validator.validate(query, schemas.pagination.schema)

    const pagination = await EmailTemplateMeta.paginate({
        page: payload.page,
        limit: payload.limit,
        query: q => q.selectAll()
            .where('template_id', '=', templateId)
            .where(undeleted)
            .orderBy('created_at', 'desc')
    })

    return pagination
})

router.get('/:id', async ({ params, acl }) => {
    const templateId = validator.validate(params.templateId, schemas.query.number)
    const metaId = validator.validate(params.id, schemas.query.number)

    const template = await EmailTemplate.findOneOrFail({
        query: q => q.where('id', '=', templateId)
            .where(undeleted)
            .selectAll()
    })

    acl.authorize('read', template)

    const templateMeta = await EmailTemplateMeta.findOneOrFail({
        query: q => q.where('id', '=', metaId)
            .where('template_id', '=', templateId)
            .where(undeleted)
            .selectAll()
    })

    return templateMeta
})

router.post('/', async ({ params, body, acl }) => {
    const templateId = validator.validate(params.templateId, schemas.query.number)
    
    const template = await EmailTemplate.findOneOrFail({
        query: q => q.where('id', '=', templateId)
            .where(undeleted)
            .selectAll()
    })

    acl.authorize('update', template)

    const payload = validator.validate(body, schemas.fileMeta.create)

    const templateMeta = await EmailTemplateMeta.updateOrCreate({
        where: eb => eb.and({
            template_id: templateId,
            name: payload.name
        }),
        values: {
            template_id: templateId,
            name: payload.name,
            value: String(payload.value)
        }
    })

    return templateMeta
})

router.delete('/:id', async ({ params, acl }) => {
    const templateId = validator.validate(params.templateId, schemas.query.number)
    const metaId = validator.validate(params.id, schemas.query.number)

    const template = await EmailTemplate.findOneOrFail({
        query: q => q.where('id', '=', templateId)
            .where(undeleted)
            .selectAll()
    })

    acl.authorize('update', template)

    const templateMeta = await EmailTemplateMeta.findOneOrFail({
        query: q => q.where('id', '=', metaId)
            .where('template_id', '=', templateId)
            .where(undeleted)
            .selectAll()
    })

    await templateMeta.softDelete()

    return templateMeta
})
