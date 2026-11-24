import { defineAuthHandler, userRepository } from '@sidekick-coder/zenith-kit/server'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'
import OauthAccount from '#server/entities/oauthAccount.entity.ts'

export default defineAuthHandler(async ({ params, acl }) => {
    const userId = validator.validate(params.id, schemas.url.number())
    const accountId = validator.validate(params.accountId, schemas.url.number())

    const user = await userRepository.findByIdOrFail(userId)

    acl.authorize('update', user)

    const account = await OauthAccount.findOne({
        where: eb => eb.and({
            id: accountId,
            user_id: userId
        })
    })

    if (account) {
        await OauthAccount.destroyById(account.id)
    }

    return { success: true }
})
