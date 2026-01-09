import { undeleted } from '#server/queries/index.ts'
import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import EmailTemplate from '#server/entities/emailTemplate.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'

const router = rootRouter.use(authMiddleware)
    .prefix('/api/email-templates')
    .group()

router.get('/', async ({ acl, query }) => {
    
    acl.authorize('read', 'EmailTemplate')

    const payload = validator.validate(query, v => v.intersect([
        schemas.pagination.base,
        v.object({
            include: v.optional(v.array(v.picklist(['metas'])))
        })
    ]))

    const pagination = await EmailTemplate.paginate({
        query: (qb) => qb.selectAll().where(undeleted),
        page: payload.page, 
        limit: payload.limit
    })

    if (payload.include) {
        await EmailTemplate.load(pagination.items, payload.include)
    }

    return pagination
})

router.get('/:id', async ({ params, acl, query: routeQuery }) => {
    const id = validator.validate(params.id, schemas.query.number)

    const payload = validator.validate(routeQuery, v => v.object({
        include: v.optional(v.array(v.picklist(['metas'])))
    }))
    
    const template = await EmailTemplate.findOrFail(id)

    acl.authorize('read', template)

    if (payload.include) {
        await EmailTemplate.load(template, payload.include)
    }

    return template
})

router.post('/', async ({ body, acl }) => {
    acl.authorize('create', 'EmailTemplate')

    const payload = validator.validate(body, schemas.emailTemplate.create)

    return EmailTemplate.create(payload)
})

router.patch('/:id', async ({ params, body, acl }) => {
    const id = validator.validate(params.id, schemas.query.number)

    const payload = validator.validate(body, schemas.emailTemplate.update)

    const template = await EmailTemplate.findOrFail(id)

    acl.authorize('update', template)

    await EmailTemplate.updateById(id, payload)

    template.merge(payload)

    return template
})

router.delete('/:id', async ({ params, acl }) => {
    const id = validator.validate(params.id, schemas.query.number)
    
    const template = await EmailTemplate.findOrFail(id)

    acl.authorize('delete', template)

    await template.softDelete()

    return template
})

router.post('/preview', async ({ body, acl, response }) => {
    const payload = validator.validate(body, v => v.object({
        engine: v.nullish(v.picklist(['raw', 'html', 'mjml'])),
        subject: v.pipe(v.string(), v.minLength(1)),
        body: v.nullish(v.string()),
    }))

    response.setHeader('Content-Type', 'text/html')

    return payload.body
})
