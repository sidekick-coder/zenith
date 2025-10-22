import FileUploadSession from '#server/entities/fileUploadSession.entity.ts'
import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import validator from '#shared/services/validator.service.ts'
import encrypt from '#server/facades/encrypt.facade.ts'
import schemas from '#shared/validators/index.ts'
import drive from '#server/facades/drive.facade.ts'
import normalizers from '#server/normalizers/index.ts'

const router = rootRouter.use(authMiddleware)
    .prefix('/api/file-upload-sessions')
    .group()

router.post('/', async ({ acl, body }) => {
    const payload = validator.validate(body, schemas.fileUploadSession.create)

    acl.authorize('create', 'FileUploadSession', payload)
    const expireAt = Date.now() + 15 * 60 * 1000 // 15 minutes

    const session = await FileUploadSession.create({
        purpose: payload.purpose,
        mime_types: payload.mime_types,
        max_size: payload.max_size,
        expires_at: normalizers.datetime.toDb(new Date(expireAt))!,
    })

    session.upload_url = await drive.uploadUrl(payload.filename)
    session.create_file_url = encrypt.url('/api/files', {
        expireAt: new Date(expireAt),
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