import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import { undeleted } from '#server/queries/index.ts'
import EmailTemplate from '#server/entities/emailTemplate.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'

export default defineAuthHandler(async ({ acl, query }) => {
    acl.authorize('read', 'EmailTemplate')

    const payload = validator.validate(query, v => v.intersect([
        schemas.pagination.base,
        v.object({ include: v.optional(v.array(v.picklist(['metas']))), }),
    ]))

    const pagination = await EmailTemplate.paginate({
        query: qb => qb.selectAll().where(undeleted),
        page: payload.page,
        limit: payload.limit,
    })

    if (payload.include) {
        await EmailTemplate.load(pagination.items, payload.include)
    }

    return pagination
})
