import { randomUUID } from 'node:crypto'
import UploadSession from '#server/entities/uploadSession.entity.ts'
import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import { undeleted } from '#server/queries/index.ts'
import validator from '#shared/services/validator.service.ts'
import encrypt from '#server/facades/encrypt.facade.ts'
import schemas from '#shared/validators/index.ts'
import drive from '#server/facades/drive.facade.ts'

const router = rootRouter.use(authMiddleware)
    .prefix('/api/upload-sessions')
    .group()

router.get('/', async ({ acl, query }) => {
    const payload = validator.validate(query, schemas.pagination.schema)

    acl.authorize('read', 'UploadSession')

    return await UploadSession.paginate({
        limit: payload.limit,
        page: payload.page,
        query: qb => qb.selectAll().where(undeleted)
            .orderBy('created_at', 'desc'),
    })
})

router.post('/', async ({ acl, body }) => {
    const payload = validator.validate(body, schemas.uploadSession.create)

    acl.authorize('create', 'UploadSession', payload)

    const session = await UploadSession.create({
        purpose: payload.purpose,
        mime_types: payload.mime_types,
        max_size: payload.max_size,
    })

    session.upload_url = await drive.uploadUrl(payload.filename)
    session.create_file_url = encrypt.url('/api/files', {
        data: {
            filename: payload.filename,
            client_name: payload.client_name,
            purpose: payload.purpose,
            drive: payload.drive || drive.selected,
            public: payload.public || false,
        }
    })

    return session
})

router.get('/:id', async ({ acl, params }) => {
    const id = validator.validate(params.id, schemas.query.number)

    const uploadSession = await UploadSession.find(id)

    acl.authorize('read', uploadSession)

    return uploadSession
})

router.put('/:id', async ({ acl, params, body }) => {
    const id = validator.validate(params.id, schemas.query.number)
    const payload = validator.validate(body, schemas.uploadSession.update)

    const uploadSession = await UploadSession.find(id)

    acl.authorize('update', uploadSession)

    return await UploadSession.updateById(id, payload)
})

router.delete('/:id', async ({ acl, params }) => {
    const id = validator.validate(params.id, schemas.query.number)

    const uploadSession = await UploadSession.findOrFail(id)

    acl.authorize('delete', uploadSession)

    await uploadSession.softDelete()

    return uploadSession
})