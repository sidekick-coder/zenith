import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'
import { paginate } from '#server/queries/index.ts'
import Role from '#shared/entities/role.entity.ts'
import User from '#server/entities/user.entity.ts'
import UserRole from '#server/entities/userRole.entity.ts'

const router = rootRouter.use(authMiddleware)
    .prefix('/api/users/:user_id/roles')
    .group()

router.get('/', async ({ query, acl, params }) => {
    const payload = validator.validate(query, schemas.pagination.schema)
    const userId = validator.validate(params.user_id, schemas.url.number())

    const user = await User.findOrFail(userId)

    acl.authorize('read', user)

    return paginate('roles', {
        serialize: Role.from,
        page: payload.page,
        limit: payload.limit,
        query: qb => qb.selectAll()
            .where('id', 'in', (eb) =>
                eb.selectFrom('user_roles')
                    .select('role_id')
                    .where('user_id', '=', userId)
            )
    })
})

router.post('/', async ({ body, params, acl }) => {
    const userId = validator.validate(params.user_id, schemas.url.number())
    const payload = validator.validate(body, v => v.object({
        role_id: v.number(),
    }))

    const user = await User.findOrFail(userId)

    const userRole = {
        user_id: user.id,
        role_id: payload.role_id,
    }

    acl.authorize('create', 'UserRole', userRole)

    await UserRole.updateOrCreate({
        where: eb => eb.and(userRole),
        values: userRole
    })

    return { success: true }
})

router.delete('/:role_id', async ({ params, acl }) => {
    const userId = validator.validate(params.user_id, schemas.url.number())
    const roleId = validator.validate(params.role_id, schemas.url.number())

    const user = await User.findOrFail(userId)

    const userRole = {
        user_id: user.id,
        role_id: roleId,
    }

    acl.authorize('delete', 'UserRole', userRole)

    const ur = await UserRole.findOne({
        where: eb => eb.and(userRole)
    })

    if (ur) {
        await UserRole.destroyById(ur.id)
    }

    return { success: true }
})