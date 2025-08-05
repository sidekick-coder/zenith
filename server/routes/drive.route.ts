import drive from '#server/facades/drive.facade.ts'
import router from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'

const group = router.use(authMiddleware)
    .prefix('/api/drives')
    .group()

group.get('/', async () => {
    const drives = drive.listDrives()

    return { data: drives }
})

group.get('/:id/files', async ({ params }) => {
    const current = drive.use(params.id)
    
    return current.list()
})