import { userRepository } from '@sidekick-coder/zenith-kit/server'
import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'
import { undeleted } from '#server/queries/index.ts'
import OauthAccount from '#server/entities/oauthAccount.entity.ts'

const router = rootRouter.use(authMiddleware)
    .prefix('/api/users/:user_id/oauth-accounts')
    .group()

router.get('/', async ({ query, acl, params }) => {
    const payload = validator.validate(query, v => v.extras.pagination())
    const userId = validator.validate(params.user_id, schemas.url.number())

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

router.get('/:id', async ({ params, acl }) => {
    const userId = validator.validate(params.user_id, schemas.url.number())
    const accountId = validator.validate(params.id, schemas.url.number())

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

router.delete('/:id', async ({ params, acl }) => {
    const userId = validator.validate(params.user_id, schemas.url.number())
    const accountId = validator.validate(params.id, schemas.url.number())

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
