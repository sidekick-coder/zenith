import BaseException from '#server/exceptions/base.ts'
import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import { update, create, findOrFail, paginate, undeleted, softDelete } from '#server/queries/index.ts'
import Permission from '#shared/entities/permission.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'

const router = rootRouter.use(authMiddleware)
    .prefix('/api/permissions')
    .group()

router.get('/', async ({ acl, query }) => {
    acl.authorize('read', 'Permission')

    const payload = validator.validate(query, schemas.pagination.schema)
    
    const pagination = await paginate('permissions', {
        limit: payload.limit,
        page: payload.page,
        serialize: Permission.from,
        query: qb => qb.selectAll().where(undeleted),
    })

    return pagination
})

router.get('/:id', async ({ acl, params }) => {
    acl.authorize('read', 'Permission')

    const permission = await findOrFail('permissions', {
        serialize: Permission.from,
        query: qb => qb.selectAll().where(undeleted)
            .where('id', '=', Number(params.id)),
    })

    if (!permission) {
        throw new BaseException('Permission not found', 404)
    }

    return permission
})

router.post('/', async ({ acl, body }) => {
    acl.authorize('create', 'Permission')

    const data = await validator.validate(body, schemas.permission.create)

    const permission = await create('permissions', {
        serialize: Permission.from,
        values: {
            name: data.name,
            action: data.action,
            subject: data.subject,
            conditions: data.conditions ? JSON.stringify(data.conditions) : null,
        }
    })

    return permission
})

router.put('/:id', async ({ acl, params, body }) => {
    acl.authorize('update', 'Permission')

    const data = await validator.validate(body, schemas.permission.update)

    const permissions = await update('permissions', {
        serialize: Permission.from,
        query: qb => qb.where(undeleted).where('id', '=', Number(params.id)),
        values: {
            name: data.name,
            description: data.description,
            action: data.action,
            subject: data.subject,
            conditions: data.conditions ? JSON.stringify(data.conditions) : null,
        }
    })

    if (permissions.length === 0) {
        throw new BaseException('Permission not found', 404)
    }

    return permissions[0]
})

router.delete('/:id', async ({ acl, params }) => {
    acl.authorize('delete', 'Permission')

    const permissions = await softDelete('permissions', {
        serialize: Permission.from,
        query: qb => qb.where(undeleted).where('id', '=', Number(params.id)),
    })

    if (permissions.length === 0) {
        throw new BaseException('Permission not found', 404)
    }

    return permissions[0]
})
