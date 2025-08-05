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

group.get('/:id', async ({ params }) => {
    const drives = drive.listDrives()
    const driveData = drives.find(d => d.id === params.id)
    
    if (!driveData) {
        throw new Error('Drive not found')
    }
    
    return driveData
})

group.get('/:id/files', async ({ params, query }) => {
    const current = drive.use(params.id)

    return current.list(query.folder as string)
})