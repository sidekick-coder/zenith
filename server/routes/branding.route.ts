import rootRouter from '#server/facades/router.facade.ts'
import validator from '#shared/services/validator.service.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import config from '#server/facades/config.facade.ts'
import server from '#server/facades/server.facade.ts'
import drive from '#server/facades/drive.facade.ts'
import schemas from '#shared/validators/index.ts'

const router = rootRouter.prefix('/api/branding')
    .use(authMiddleware)
    .group()

router.get('/', async () => {
    const branding = config.get('branding', {})

    if (branding.logoFileId) {
        branding.logoUrl = await drive.url(branding.logoFileId)
    }

    return branding
})

router.put('/', async ({ body }) => {
    const payload = validator.validate(body, schemas.branding.update)

    config.set('branding', payload)

    await server.reload()

    return config.get('branding', {})
})

export default router