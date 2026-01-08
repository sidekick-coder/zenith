import fs from 'fs'
import { Readable } from 'stream'
import mime from 'mime'
import BaseException from '#server/exceptions/base.ts'
import drive from '#server/facades/drive.facade.ts'
import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import encrypt from '#server/facades/encrypt.facade.ts'
import validator from '#shared/services/validator.service.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import { AuthorizationMiddleware } from '#server/middlewares/authorization.middleware.ts'
import DriveConfig from '#server/entities/driveConfig.entity.ts'
import RouterResourceConfigService from '#server/services/routerResourceConfig.service.ts'
import config from '#server/facades/config.facade.ts'
import MailerConfig from '#server/entities/mailerConfig.entity.ts'

const router = rootRouter.use(authMiddleware)
    .prefix('/api/mailers')
    .group()

const manage = AuthorizationMiddleware.create({
    action: 'manage',
    resource: 'Config',
    conditions: {
        key: 'mailer.gateways'
    }
})

const resource = new RouterResourceConfigService(MailerConfig, {
    middleware: { all: manage },
})

// resource.on('afterSave', () => drive.load())
// resource.on('afterDestroy', () => drive.load())

resource.register(router)

router.post('/:id/set-default', async ({ params, acl }) => {
    const mailer = await MailerConfig.findOrFail(params.id)

    acl.authorize('update', 'Config', {
        key: 'mailer.default'
    })

    config.set('mailer.default', mailer.id)
})
