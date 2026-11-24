import { defineAuthHandler, userRepository } from '@sidekick-coder/zenith-kit/server'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'
import { paginate } from '#server/queries/index.ts'
import Role from '#shared/entities/role.entity.ts'

export default defineAuthHandler(async ({ query, acl, params }) => {
    const payload = validator.validate(query, schemas.pagination.schema)
    const userId = validator.validate(params.id, schemas.url.number())

    const user = await userRepository.findByIdOrFail(userId)

    acl.authorize('read', 'User', user)

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
