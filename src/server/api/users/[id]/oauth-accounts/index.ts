import { defineAuthHandler, userRepository } from '@sidekick-coder/zenith-kit/server'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'
import { undeleted } from '#server/queries/index.ts'
import OauthAccount from '#server/entities/oauthAccount.entity.ts'

export default defineAuthHandler(async ({ query, acl, params }) => {
    const payload = validator.validate(query, v => v.extras.pagination())
    const userId = validator.validate(params.id, schemas.url.number())

    const user = await userRepository.findByIdOrFail(userId)

    acl.authorize('read', user)

    return OauthAccount.paginate({
        page: payload.page,
        limit: payload.limit,
        query: qb => qb.selectAll()
            .where('user_id', '=', userId)
            .where(undeleted)
    })
})
