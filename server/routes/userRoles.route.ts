import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'
import { paginate } from '#server/queries/index.ts'
import Role from '#shared/entities/role.entity.ts'
import User from '#server/entities/user.entity.ts'

const router = rootRouter.use(authMiddleware)
    .prefix('/api/users/:userId/roles')
    .group()

router.get('/', async ({ query, acl, params }) => {
    const payload = validator.validate(query, schemas.pagination.schema)
    const userId = Number(params.userId)

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
