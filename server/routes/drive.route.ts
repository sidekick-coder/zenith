import { randomUUID } from 'crypto'
import { join } from 'path'
import mime from 'mime'
import BaseException from '#server/exceptions/base.ts'
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

group.post('/:id/upload', async (ctx) => {
    const current = drive.use(ctx.params.id)
    const file = await ctx.file('file')

    if (!file) {
        throw new BaseException('No file provided')
    }

    let filename = ctx.query.filename || undefined

    if (!filename) {
        filename = randomUUID() + '.' + mime.getExtension(file.mimetype)
    }

    if (ctx.query.directory) {
        filename = join(ctx.query.directory, filename)
    }

    console.log(file)

    const entity = await current.write(filename, file.buffer)

    return {
        data: entity,
        message: 'File uploaded successfully'
    }
})
