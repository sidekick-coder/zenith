import BaseException from '#server/exceptions/base.ts'
import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import userRepository from '#server/repositories/user.repository.ts'
import validator from '#shared/services/validator.service.ts'
import { $t } from '#shared/lang.ts' 
import schemas from '#shared/validators/index.ts'
import { update, create, findOrFail, paginate, undeleted, softDelete } from '#server/queries/index.ts'
import Role from '#shared/entities/role.entity.ts'

const router = rootRouter.use(authMiddleware)
    .prefix('/api/users/:userId/roles')
    .group()

router.get('/', async ({ query, params }) => {
    const payload = validator.validate(query, schemas.pagination.schema)
    const userId = Number(params.userId)

    const user = await findOrFail('users', {
        query: qb => qb.selectAll()
            .where('id', '=', userId),
    })

    if (!user) {
        throw new BaseException($t('User not found'), 404)
    }

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
