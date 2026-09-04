import rootRouter from '#server/facades/router.facade.ts'
import validator from '#shared/services/validator.service.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import config from '#server/facades/config.facade.ts'
import schemas from '#shared/validators/index.ts'
import File from '#server/entities/file.entity.ts'

const router = rootRouter.prefix('/api/configs/auth')
    .use(authMiddleware)
    .group()

router.get('/', async ({ acl }) => {
    acl.authorize('read', 'Config', { key: 'auth' })

    return config.get('auth', {})
})

router.put('/', async ({ body, acl }) => {
    acl.authorize('update', 'Config', { key: 'auth' })

    const payload = validator.validate(body, schemas.auth.update)

    const auth: any = { 
        ...config.get('auth', {}),
        ...payload
    }

    if (auth.image_id) {
        const file = await File.findOrFail(auth.image_id)

        await file.loadUrl()

        auth.image_drive = file.drive || null
        auth.image_url = file.url
        
    }

    config.set('auth', auth)

    return config.get('auth', {})
})

export default router