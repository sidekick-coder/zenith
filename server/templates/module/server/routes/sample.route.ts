import router from '#server/facades/router.facade.ts'

router.post('/api/<%= name %>/home', async () => {
    return {
        message: 'This route has been disabled.'
    }
})