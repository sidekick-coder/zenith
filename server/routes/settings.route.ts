import config from '#server/facades/config.facade.ts'
import router from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'

const group = router.use(authMiddleware)
    .prefix('/api/settings')
    .group()

group.get('/site', async () => {
    const site = config.get('site', {})

    return site
})

group.put('/site', async (req) => {
    const { body } = req

    config.set('site', body)

    return body
})