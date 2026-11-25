import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import { paginate, undeleted } from '#server/queries/index.ts'
import Permission from '#shared/entities/permission.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'

export default defineAuthHandler(async ({ acl, query }) => {
    acl.authorize('read', 'Permission')

    const payload = validator.validate(query, schemas.pagination.schema)

    return paginate('permissions', {
        limit: payload.limit,
        page: payload.page,
        serialize: Permission.from,
        query: qb => qb.selectAll()
            .where(undeleted)
            .orderBy('created_at', 'desc'),
    })
})
