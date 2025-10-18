import config from '#server/facades/config.facade.ts'
import router from '#server/facades/router.facade.ts'

router.get('/api/health', async () => {
    return {
        status: 'ok',
    }
})