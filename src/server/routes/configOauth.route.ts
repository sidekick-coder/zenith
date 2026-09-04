import config from '@sidekick-coder/zenith-kit/server/facades/config'
import rootRouter from '#server/facades/router.facade.ts'
import validator from '#shared/services/validator.service.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import schemas from '#shared/validators/index.ts'
import File from '#server/entities/file.entity.ts'

const router = rootRouter.prefix('/api/configs/oauth')
    .use(authMiddleware)
    .group()

router.get('/', async ({ acl }) => {
    acl.authorize('read', 'Config', { key: 'oauth' })

    return config.get('oauth', {})
})

router.patch('/', async ({ body, acl }) => {
    acl.authorize('update', 'Config', { key: 'oauth' })

    const payload = validator.validate(body, v => v.object({
        google_enabled: v.optional(v.boolean()),
        google_client_id: v.optional(v.string()),
        google_client_secret: v.optional(v.string()),
    }))

    const auth: any = { 
        ...config.get('oauth', {}),
        ...payload
    }

    if (auth.image_id) {
        const file = await File.findOrFail(auth.image_id)

        await file.loadUrl()

        auth.image_drive = file.drive || null
        auth.image_url = file.url
    }

    config.set('oauth', auth)

    return config.get('oauth', {})
})

export default router
