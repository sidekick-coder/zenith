import BaseException from '#server/exceptions/base.ts'
import db from '#server/facades/db.facade.ts'
import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import { list } from '#server/queries/index.ts'
import Role from '#shared/entities/role.entity.ts'
import validator from '#shared/services/validator.service.ts'

const router = rootRouter.use(authMiddleware)
    .prefix('/api/roles')
    .group()

router.get('/', async ({ acl }) => {
    
    acl.authorize('read', 'roles')
    
    const data = await list('roles', { serialize: r => new Role(r) })

    return { data }
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

router.post('/', async ({ body }) => {
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

router.patch('/:id', async ({ params, body }) => {
    const payload = validator.validate(body, (v) => v.object({
        name: v.optional(v.pipe(v.string(), v.minLength(3))),
        description: v.optional(v.string()),
    }))

    const row = await db.updateTable('roles')
        .set(payload)
        .where('id', '=', Number(params.id))
        .returningAll()
        .executeTakeFirst()

    if (!row) {
        throw new BaseException('Failed to update role', 500)
    }

    return new Role(row)
})

router.delete('/:id', async ({ params }) => {
    const row = await db.deleteFrom('roles')
        .where('id', '=', Number(params.id))
        .returningAll()
        .executeTakeFirst()

    if (!row) {
        throw new BaseException('Failed to delete role', 500)
    }

    return new Role(row)
})