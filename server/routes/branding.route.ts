import rootRouter from '#server/facades/router.facade.ts'
import validator from '#shared/services/validator.service.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import config from '#server/facades/config.facade.ts'
import schemas from '#shared/validators/index.ts'
import branding from '#server/facades/branding.facade.ts'

const router = rootRouter.prefix('/api/branding')
    .use(authMiddleware)
    .group()

router.get('/', async () => {
    const data = config.get('branding', {})

    if (data.logoFileId) {
        data.logoUrl = `/api/files/${data.logoFileId}/stream`
    }

    return data
})

router.put('/', async ({ body, acl }) => {

    acl.authorize('update', 'branding')

    const payload = validator.validate(body, schemas.branding.update)

    config.set('branding', payload)
    
    await branding.load()

    return payload
})

export default router