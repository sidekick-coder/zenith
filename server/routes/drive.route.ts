import { randomUUID } from 'crypto'
import { join } from 'path'
import mime from 'mime'
import BaseException from '#server/exceptions/base.ts'
import drive from '#server/facades/drive.facade.ts'
import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import encrypt from '#server/facades/encrypt.facade.ts'

const router = rootRouter.use(authMiddleware)
    .prefix('/api/drives')
    .group()

router.get('/', async ({ acl }) => {
    acl.authorize('read', 'Drive')

    const drives = drive.listDrives()

    return { items: drives }
})

router.get('/:id', async ({ params, acl }) => {
    const drives = drive.listDrives()
    const driveData = drives.find(d => d.id === params.id)
    
    if (!driveData) {
        throw new Error('Drive not found')
    }

    acl.authorize('read', 'Drive', driveData)
    
    return driveData
})

router.post('/generate-defaults', async ({ acl }) => {
    acl.authorize('create', 'Drive')

    await drive.createDefaultDrives()

    return { message: 'Default drives created' }
})

router.get('/:id/files', async ({ params, query, acl }) => {
    const current = drive.use(params.id)

    acl.authorize('read', 'Drive', current)

    return current.list(query.folder as string)
})

router.get('/:id/stream/:basename', async ({ params, query, response, acl }) => {
    const current = drive.use(params.id)

    const filename = query.filename ? decodeURIComponent(query.filename as string) : undefined
    const basename = params.basename
    const key = query.key ? decodeURIComponent(query.key as string) : undefined


    if (!filename) {
        throw new BaseException('No filename provided', 400)
    }

    if (!key) {
        acl.authorize('read', 'Drive', current)
    }

    const decrypted = encrypt.decrypt(key as string) 

    if (!decrypted) {
        throw new BaseException('Invalid key', 400)
    }

    const dataKey = JSON.parse(decrypted) as { filename: string, expireAt: number }

    if (dataKey.filename !== filename) {
        throw new BaseException('Invalid key', 400)
    }

    if (dataKey.expireAt < Date.now()) {
        throw new BaseException('Key has expired', 400)
    }

    const entry = await current.find(filename as string)

    if (entry.type !== 'file') {
        throw new BaseException('Not a file', 400)
    }

    const data = await current.read(filename as string)
    const mimetype = mime.getType(basename as string) || 'application/octet-stream'

    response.set('Content-Type', mimetype || 'application/octet-stream')
    response.set('Content-Length', String(data.length))
    response.set('Content-Disposition', `inline; filename="${basename}"`)

    response.status(200).send(data)
})

router.post('/:id/upload', async ({ acl, params, query, upload }) => {
    const current = drive.use(params.id)

    acl.authorize('create', 'Drive', current)

    const file = await upload.single('file')

    if (!file) {
        throw new BaseException('No file provided')
    }

    let filename = query.filename as string || undefined

    if (!filename) {
        filename = randomUUID() + '.' + mime.getExtension(file.mimetype)
    }

    const entity = await current.write(filename, file.buffer)

    return {
        data: entity,
        message: 'File uploaded successfully'
    }
})


