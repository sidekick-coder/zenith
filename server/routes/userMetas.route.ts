import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import UserMeta from '#server/entities/userMeta.entity.ts'
import User from '#server/entities/user.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'
import { undeleted } from '#server/queries/index.ts'

const router = rootRouter.use(authMiddleware)
    .prefix('/api/users/:userId/metas')
    .group()

router.get('/', async ({ params, acl, query }) => {
    const userId = validator.validate(params.userId, schemas.query.number)
    
    const user = await User.findOneOrFail({
        query: q => q.where('id', '=', userId)
            .where(undeleted)
            .selectAll()
    })

    acl.authorize('read', user)

    const payload = validator.validate(query, schemas.pagination.schema)

    const pagination = await UserMeta.paginate({
        page: payload.page,
        limit: payload.limit,
        query: q => q.selectAll()
            .where('user_id', '=', userId)
            .where(undeleted)
            .orderBy('created_at', 'desc')
    })

    return pagination
})

router.get('/:id', async ({ params, acl }) => {
    const userId = validator.validate(params.userId, schemas.query.number)
    const metaId = validator.validate(params.id, schemas.query.number)

    const user = await User.findOneOrFail({
        query: q => q.where('id', '=', userId)
            .where(undeleted)
            .selectAll()
    })

    acl.authorize('read', user)

    const userMeta = await UserMeta.findOneOrFail({
        query: q => q.where('id', '=', metaId)
            .where('user_id', '=', userId)
            .where(undeleted)
            .selectAll()
    })

    return userMeta
})

router.put('/', async ({ params, body, acl }) => {
    const userId = validator.validate(params.userId, schemas.query.number)
    
    const user = await User.findOneOrFail({
        query: q => q.where('id', '=', userId)
            .where(undeleted)
            .selectAll()
    })

    acl.authorize('update', user)

    const payload = validator.validate(body, v => v.union([
        schemas.userMeta.create,
        v.array(schemas.userMeta.create)
    ]))

    const items = Array.isArray(payload) ? payload : [payload]

    for await (const item of items) {
        await UserMeta.updateOrCreate({
            where: eb => eb.and({
                user_id: userId,
                name: item.name
            }),
            values: {
                user_id: userId,
                name: item.name,
                value: item.value
            }
        })
    }

    return payload
})

router.delete('/:id', async ({ params, acl }) => {
    const userId = validator.validate(params.userId, schemas.query.number)
    const metaId = validator.validate(params.id, schemas.query.number)

    const user = await User.findOneOrFail({
        query: q => q.where('id', '=', userId)
            .where(undeleted)
            .selectAll()
    })

    acl.authorize('update', user)

    const userMeta = await UserMeta.findOneOrFail({
        query: q => q.where('id', '=', metaId)
            .where('user_id', '=', userId)
            .where(undeleted)
            .selectAll()
    })

    await userMeta.softDelete()

    return userMeta
})
