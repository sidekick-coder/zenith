import router from '#server/facades/router.facade.ts'

router.get('/api/health', async () => {
    return { status: 'ok', }
})
