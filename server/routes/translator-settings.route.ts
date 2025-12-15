import rootRouter from '#server/facades/router.facade.ts'
import validator from '#shared/services/validator.service.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import config from '#server/facades/config.facade.ts'
import schemas from '#shared/validators/index.ts'
import translator from '#server/facades/translator.facade.ts'

const router = rootRouter.prefix('/api/translator-settings')
    .use(authMiddleware)
    .group()

router.get('/', async ({ acl }) => {
    acl.authorize('read', 'Config', { key: 'translator' })

    return config.get('translator', {})
})

router.put('/', async ({ body, acl }) => {
    acl.authorize('update', 'Config', { key: 'translator' })

    const payload = validator.validate(body, schemas.translator.update)

    const data: any = { 
        ...config.get('translator', {}),
        ...payload
    }

    config.set('translator', data)

    translator.load(data.defaultLocale || 'en')

    return config.get('translator', {})
})

export default router
