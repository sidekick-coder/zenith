import { defineAuthHandler, userRepository } from '@sidekick-coder/zenith-kit/server'
import UserMeta from '#server/entities/userMeta.entity.ts'
import validator from '#shared/services/validator.service.ts'
import { undeleted } from '#server/queries/index.ts'

export default defineAuthHandler(async ({ params, acl }) => {
    const userId = validator.validate(params.id, v => v.extras.url.number())
    const metaId = validator.validate(params.metaId, v => v.extras.url.number())
    const user = await userRepository.findByIdOrFail(userId)

    acl.authorize('update', user)

    const userMeta = await UserMeta.findOneOrFail({
        query: q => q
            .selectAll()
            .where('id', '=', metaId)
            .where('user_id', '=', userId)
            .where(undeleted)
    })

    await userMeta.softDelete()

    return userMeta
})
