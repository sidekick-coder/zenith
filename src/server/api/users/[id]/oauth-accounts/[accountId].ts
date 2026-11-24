import { defineAuthHandler, userRepository } from '@sidekick-coder/zenith-kit/server'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'
import { undeleted } from '#server/queries/index.ts'
import OauthAccount from '#server/entities/oauthAccount.entity.ts'

export default defineAuthHandler(async ({ params, acl }) => {
    const userId = validator.validate(params.id, schemas.url.number())
    const accountId = validator.validate(params.accountId, schemas.url.number())

    const user = await userRepository.findByIdOrFail(userId)

    acl.authorize('read', user)

    const account = await OauthAccount.findOne({
        where: eb => eb.and([
            eb('id', '=', accountId),
            eb('user_id', '=', userId),
            undeleted(eb)
        ])
    })

    if (!account) {
        throw new Error('OAuth account not found')
    }

    return OauthAccount.from(account)
})
