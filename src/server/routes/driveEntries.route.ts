import { join } from 'path'
import mime from 'mime'
import drive from '#server/facades/drive.facade.ts'
import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import validator from '#shared/services/validator.service.ts'
import BaseException from '#server/exceptions/base.ts'
import FileUploadSession from '#server/entities/fileUploadSession.entity.ts'
import normalizers from '#server/normalizers/index.ts'
import { cuid } from '#server/utils/cuid.util.ts'

const router = rootRouter
    .use(authMiddleware)
    .prefix('/api/drives/:drive_id/entries')
    .group()

router.get('/', async ({ params, query, acl }) => {
    const current = drive.use(params.drive_id)

    acl.authorize('read', 'Drive', current)

    return current.list(query.folder as string)
})

router.get('/show/*', async ({ params, acl }) => {
    const filename = validator.validate(params['*'], v => v.string())
    const current = drive.use(params.drive_id)

    acl.authorize('read', 'DriveEntry', { filename })

    return current.find(filename)
})

router.get('/read/*', async ({ params, acl, response }) => {
    const filename = validator.validate(params['*'], v => v.string())
    const basename = filename.split('/').pop() || 'file'
    const current = drive.use(params.drive_id)

    acl.authorize('read', 'DriveEntry', { filename })

    const entry = await current.find(filename)

    if (entry.type !== 'file') {
        throw new BaseException($t('Entry is not a file'), 400)
    }

    const mimetype = mime.getType(basename) || 'application/octet-stream'
    const stream = await current.readStream(filename)

    response.set('Content-Type', mimetype)
    response.set('Content-Disposition', `inline; filename="${basename}"`)

    stream.pipe(response)

    return new Promise<void>((resolve, reject) => {
        stream.on('end', resolve)
        stream.on('error', reject)
    })
})

router.get('/open/*', async ({ params, acl, response }) => {
    const filename = validator.validate(params['*'], v => v.string())
    const current = drive.use(params.drive_id)

    acl.authorize('read', 'DriveEntry', { filename })

    const url = await current.url(filename, { expires: '15m' })

    response.redirect(url)
})

router.delete('/*', async ({ params, acl }) => {
    const filename = validator.validate(params['*'], v => v.string())
    const current = drive.use(params.drive_id)

    acl.authorize('delete', 'DriveEntry', { filename })

    await current.delete(filename)

    return { success: true }
})

router.post('/upload-sessions', async ({ params, body, acl }) => {
    const payload = validator.validate(body, v => v.object({
        client_name: v.pipe(v.string(), v.minLength(1)),
        folder: v.optional(v.string()),
        mime_types: v.optional(v.string(), '*/*'),
        max_size: v.optional(v.number(), 50 * 1024 * 1024),
    }))

    const current = drive.use(params.drive_id)

    acl.authorize('create', 'DriveEntry', { filename: payload.client_name })

    const ext = payload.client_name.split('.').pop() || ''
    let filename = cuid() + (ext ? `.${ext}` : '')

    if (payload.folder) {
        filename = join(payload.folder.replace(/^\//, ''), filename)
    }

    const expireAt = Date.now() + 15 * 60 * 1000

    const session = await FileUploadSession.create({
        purpose: 'drive-entry',
        mime_types: payload.mime_types,
        max_size: payload.max_size,
        expires_at: normalizers.datetime.toDb(new Date(expireAt))!,
    })

    session.upload_url = await current.uploadUrl(filename, {
        expires: '15m',
        mime_types: payload.mime_types,
        max_size: payload.max_size,
    })

    return session
})
