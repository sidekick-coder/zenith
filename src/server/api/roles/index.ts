import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import Role from '#server/entities/role.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'
import { undeleted } from '#server/queries/index.ts'

export default defineAuthHandler(async ({ acl, query }) => {
    acl.authorize('read', 'Role')

    const { page, limit } = validator.validate(query, schemas.pagination.schema)

    return Role.paginate({
        query: qb => qb.selectAll().where(undeleted),
        page,
        limit,
    })
})
