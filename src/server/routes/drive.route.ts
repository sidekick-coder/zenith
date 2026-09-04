import mime from 'mime'
import { tryCatch } from '@sidekick-coder/zenith-kit/shared/utils/tryCatch'
import config from '@sidekick-coder/zenith-kit/server/facades/config'
import BaseException from '#server/exceptions/base.ts'
import drive from '#server/facades/drive.facade.ts'
import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import encrypt from '#server/facades/encrypt.facade.ts'
import validator from '#shared/services/validator.service.ts'
import { AuthorizationMiddleware } from '#server/middlewares/authorization.middleware.ts'
import DriveConfig from '#server/entities/driveConfig.entity.ts'
import RouterResourceConfigService from '#server/services/routerResourceConfig.service.ts'

const router = rootRouter.use(authMiddleware)
    .prefix('/api/drives')
    .group()

const manage = AuthorizationMiddleware.create({
    action: 'manage',
    resource: 'Config',
    conditions: { key: 'drive.disks' }
})

const resource = new RouterResourceConfigService(DriveConfig, { middleware: { all: manage }, })

resource.on('afterSave', () => drive.load())
resource.on('afterDestroy', () => drive.load())

resource.register(router)

router.post('/:id/set-default', async ({ params, acl }) => {
    const current = drive.use(params.id)

    if (!current) {
        throw new BaseException($t('Drive not found'), 404)
    }

    acl.authorize('write', 'Config', { key: 'drive.default' })

    config.set('drive.default', params.id)

    await drive.load()
})

router.get('/:id/open/*', async ({ params, acl, response }) => {
    const filename = validator.validate(params['*'], v => v.string())
    const id = params.id
    
    const current = drive.use(id)

    acl.authorize('read', 'DriveEntry', { filename })

    const url = await current.url(filename, { expires: '15m', })

    response.redirect(url)
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

        const [error, entry] = await tryCatch(() => current.find(filename))

        if (error || entry.type !== 'file') {
            throw new BaseException('File not found', 404)
        }
        
        const mimetype = mime.getType(basename) || 'application/octet-stream'

        const stream = await current.readStream(filename)

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

    return {
        stream: response.body as unknown as NodeJS.ReadableStream,
        size,
        contentType,
    }
}

rootRouter
    .prefix('/api/drives')
    .put('/:id/upload/*', async ({ acl, params, query, request, response }) => {
        const filename = validator.validate(params['*'], v => v.string())
        const current = drive.use(params.id)
        const key = validator.validate(query.key, v => v.optional(v.string()))
        let size = null as number | null
        
        if (request.headers['content-length']) {
            size = Number(request.headers['content-length'])
        }

        if (!key) {
            throw new BaseException('Upload key is required', 400)
        }

        if (!size || size <= 0) {
            throw new BaseException('Content-Length header is required for upload', 400)
        }

        const data = encrypt.verifyUrl(key)

        current.validateUpload(data, {
            mimetype: mime.getType(filename) || 'application/octet-stream',
            size: size,
        })
    
        await current.writeStream(filename, request)

        return { success: true }
    })


