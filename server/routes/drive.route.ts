import drive from '#server/facades/drive.facade.ts'
import router from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'

const group = router.use(authMiddleware).group()

group.get('/drives/:id/files', async ({ params }) => {
    const current = drive.use(params.id)
    
    return current.list()
})