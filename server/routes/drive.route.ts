import fs from 'fs'
import { Readable } from 'stream'
import mime from 'mime'
import BaseException from '#server/exceptions/base.ts'
import drive from '#server/facades/drive.facade.ts'
import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import encrypt from '#server/facades/encrypt.facade.ts'
import validator from '#shared/services/validator.service.ts'

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

rootRouter
    .prefix('/api/drives')
    .get('/:id/stream/*', async ({ params, query, response, acl }) => {    
        const filename = validator.validate(params['*'], v => v.string())
        const basename = filename.split('/').pop() || 'file'
        const current = drive.use(params.id)
    
        const key = validator.validate(query.key, v => v.optional(v.string()))

        if (key) {
            encrypt.verifyUrl(key)
        }

        if (!key) {
            acl.authorize('read', 'DriveEntry', { filename })
        }

        const entry = await current.find(filename)

        if (entry.type !== 'file') {
            throw new BaseException('Not a file', 400)
        }

        const data = await current.read(filename)
        const mimetype = mime.getType(basename) || 'application/octet-stream'

        const stream = await current.readStream(filename, data)

        response.set('Content-Type', mimetype || 'application/octet-stream')
        response.set('Content-Disposition', `inline; filename="${basename}"`)

        stream.pipe(response)

        return new Promise<void>((resolve, reject) => {
        // Optional: Handle when the stream finishes
            stream.on('error', reject)
            stream.on('end', resolve)

        })
    })
async function downloadStream(url: string) {
    const response = await fetch(url)

    if (!response.ok)  throw new BaseException('Failed to download remote file')
    if (!response.body) throw new BaseException('Remote file has no body')

    const size = Number(response.headers.get('content-length')) || undefined
    const contentType = response.headers.get('content-type') || 'application/octet-stream'

    console.log({
        size,
        contentType
    })

    return {
        stream: response.body as unknown as NodeJS.ReadableStream,
        size,
        contentType,
    }
}

rootRouter
    .prefix('/api/drives')
    .post('/:id/upload/*', async ({ acl, params, query, upload }) => {
        const filename = validator.validate(params['*'], v => v.string())
        const current = drive.use(params.id)
        const file = await upload.single('file')
        const url = query.url as string | undefined
    
        const key = validator.validate(query.key, v => v.optional(v.string()))
    
        if (!file && !url) {
            throw new BaseException('No file or URL provided', 400)
        }

        if (!key) {
            acl.authorize('create', 'DriveEntry', { filename })
        }

        if (file) {
            if (key) {
                const data = encrypt.verifyUrl(key)

                current.validateUpload(data, {
                    mimetype: mime.getType(file.originalname) || 'application/octet-stream',
                    size: file.size
                })
            }

            const stream = fs.createReadStream(file.path)
        
            await current.writeStream(filename, stream)

            return { success: true }
        
        }

        if (url) {

            const remote = await downloadStream(url)

            if (key) {
                const data = encrypt.verifyUrl(key)

                current.validateUpload(data,
                    {
                        mimetype: remote.contentType!,
                        size: remote.size! 
                    },
                )
            }

            await current.writeStream(filename, Readable.fromWeb(remote.stream as any))

            return { success: true }

        }

        throw new BaseException('No file or URL provided', 400)
    })


