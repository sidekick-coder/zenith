import { defineAuthHandler, userRepository } from '@sidekick-coder/zenith-kit/server'
import UserMeta from '#server/entities/userMeta.entity.ts'
import validator from '#shared/services/validator.service.ts'
import { undeleted } from '#server/queries/index.ts'

export default defineAuthHandler(async ({ params, acl, query }) => {
    const userId = validator.validate(params.id, v => v.extras.url.number())
    const user = await userRepository.findByIdOrFail(userId)

    acl.authorize('read', user)

    const payload = validator.validate(query, v => v.extras.pagination())

    return UserMeta.paginate({
        page: payload.page,
        limit: payload.limit,
        query: q => q.selectAll()
            .where('user_id', '=', userId)
            .where(undeleted)
            .orderBy('created_at', 'desc')
    })
})
