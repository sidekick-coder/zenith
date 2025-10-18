import rootRouter from '#server/facades/router.facade.ts'
import validator from '#shared/services/validator.service.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import config from '#server/facades/config.facade.ts'
import schemas from '#shared/validators/index.ts'

const router = rootRouter.prefix('/api/branding')
    .use(authMiddleware)
    .group()

router.get('/', async () => {
    return config.get('branding', {})
})

router.put('/', async ({ body }) => {
    const payload = validator.validate(body, schemas.branding.update)

    config.set('branding', payload)

    return config.get('branding', {})
})

export default router