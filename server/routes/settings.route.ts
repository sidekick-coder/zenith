import config from '#server/facades/config.facade.ts'
import router from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'

const group = router.use(authMiddleware)
    .prefix('/api/settings')
    .group()

group.get('/site', async ({ acl }) => {
    acl.authorize('read', 'Config', { key: 'site' })

    return config.get('site', {})
})

group.put('/site', async ({ acl, body }) => {
    acl.authorize('update', 'Config', { key: 'site' })

    config.set('site', body)

    return body
})