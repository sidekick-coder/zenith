import config from '@sidekick-coder/zenith-kit/server/facades/config'
import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import { AuthorizationMiddleware } from '#server/middlewares/authorization.middleware.ts'
import RouterResourceConfigService from '#server/services/routerResourceConfig.service.ts'
import MailerConfig from '#server/entities/mailerConfig.entity.ts'
import mailer from '#server/facades/mailer.facade.ts'

const router = rootRouter.use(authMiddleware)
    .prefix('/api/mailers')
    .group()

const manage = AuthorizationMiddleware.create({
    action: 'manage',
    resource: 'Config',
    conditions: { key: 'mailer.gateways' }
})

const resource = new RouterResourceConfigService(MailerConfig, { middleware: { all: manage }, })

resource.register(router)

router.post('/:id/set-default', async ({ params, acl }) => {
    const mailerConfig = await MailerConfig.findOrFail(params.id)

    acl.authorize('update', 'Config', { key: 'mailer.default' })

    config.set('mailer.default', mailerConfig.id)

    mailer.selectedGateway = mailerConfig.id
})
