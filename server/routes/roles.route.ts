import BaseException from '#server/exceptions/base.ts'
import db from '#server/facades/db.facade.ts'
import { undeleted } from '#server/queries/index.ts'
import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import Role from '#server/entities/role.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'

const router = rootRouter.use(authMiddleware)
    .prefix('/api/roles')
    .group()

router.get('/', async ({ acl, query }) => {
    
    acl.authorize('read', 'Role')

    const { page, limit } = validator.validate(query, schemas.pagination.schema)

    return Role.paginate({
        query: (qb) => qb.selectAll().where(undeleted),
        page, 
        limit
    })
})

router.get('/:id', async ({ params, acl }) => {
    const row = await db.selectFrom('roles')
        .selectAll()
        .where('id', '=', Number(params.id))
        .executeTakeFirst()

    if (!row) {
        throw new BaseException('Role not found', 404)
    }

    const role = new Role(row)

    acl.authorize('read', role)

    return new Role(row)
})

router.post('/', async ({ body, acl }) => {
    acl.authorize('create', 'Role')

    const payload = validator.validate(body, (v) => v.object({
        name: v.pipe(v.string(), v.minLength(3)),
        description: v.optional(v.string()),
    }))

    const row = await db.insertInto('roles').values(payload)
        .returningAll()
        .executeTakeFirst()

    if (!row) {
        throw new BaseException('Failed to create role', 500)
    }

    return new Role(row)
})

router.patch('/:id', async ({ params, body, acl }) => {
    const id = validator.validate(params.id, schemas.query.number)

    const payload = validator.validate(body, (v) => v.object({
        name: v.optional(v.pipe(v.string(), v.minLength(3))),
        description: v.optional(v.string()),
    }))

    const role = await Role.findOrFail(id)

    acl.authorize('update', role)

    await Role.updateById(id, payload)

    role.merge(payload)

    return role
})

router.delete('/:id', async ({ params, acl }) => {
    const id = validator.validate(params.id, schemas.query.number)
    
    const role = await Role.findOrFail(id)

    acl.authorize('delete', role)

    await role.softDelete()

    return role
})