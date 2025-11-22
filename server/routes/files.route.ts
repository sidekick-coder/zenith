import mime from 'mime'
import File from '#server/entities/file.entity.ts'
import BaseException from '#server/exceptions/base.ts'
import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import { undeleted } from '#server/queries/index.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'
import drive from '#server/facades/drive.facade.ts'
import encrypt from '#server/facades/encrypt.facade.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

const router = rootRouter.use(authMiddleware)
    .prefix('/api/files')
    .group()

router.get('/', async ({ acl, query }) => {
    const payload = validator.validate(query, schemas.pagination.schema)

    acl.authorize('read', 'File')

    const files = await File.paginate({
        limit: payload.limit,
        page: payload.page,
        query: qb => qb.selectAll().where(undeleted)
            .orderBy('created_at', 'desc'),
    })

    await Promise.all(files.items.map(file => file.loadUrl()))

    return files
})

router.post('/', async ({ query }) => {
    const key = validator.validate(query.key, v => v.string())

    const data = encrypt.verifyUrl(key)

    const payload = validator.validate(data, v => v.object({
        filename: v.string(),
        client_name: v.string(),
        drive: v.string(),
        purpose: v.string(),
        public: v.boolean(),
    }))

    const file = await File.create({
        ...payload,
        mimetype: mime.getType(payload.filename) || 'application/octet-stream',
    })

    await file.loadUrl()

    return file
})

router.get('/:id', async ({ acl, params }) => {
    const id = validator.validate(params.id, schemas.query.number)

    const file = await File.find(id)

    acl.authorize('read', file)

    return file
})

rootRouter
    .get('/api/files/:id/stream', async ({ params,acl, response }) => {
        const id = validator.validate(params.id, schemas.query.number)

        const file = await File.findOneOrFail({
            query: qb => qb.selectAll().where('id', '=', id),
        })

        if (!file) {
            throw new BaseException('File not found', 404)
        }

        if (!file.public) {
            acl.authorize('read', file)
        }

        const stream = await file.readStream()

        response.set('Content-Type', file.mimetype || 'application/octet-stream')
        response.set('Content-Disposition', `inline; filename="${file.client_name}"`)
        
        stream.pipe(response)

        stream.on('error', (streamErr) => {
            console.error(`Error streaming file: ${streamErr}`)
            response.status(500).send('Error streaming file')
        })

        return new Promise<void>((resolve, reject) => {
            // Optional: Handle when the stream finishes
            stream.on('error', reject)
            stream.on('end', resolve)

        })
    })


router.delete('/:id', async ({ params, acl }) => {
    const id = validator.validate(params.id, schemas.query.number())

    const file = await File.findOneOrFail({
        query: q => q
            .where('id', '=', id)
            .where(undeleted)
            .selectAll()
    })

    acl.authorize('delete', file)

    await file.softDelete()

    return {
        success: true
    }
})