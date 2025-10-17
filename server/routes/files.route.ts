import File from '#server/entities/file.entity.ts'
import BaseException from '#server/exceptions/base.ts'
import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import { undeleted } from '#server/queries/index.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'
import drive from '#server/facades/drive.facade.ts'

const router = rootRouter.use(authMiddleware)
    .prefix('/api/files')
    .group()

router.get('/', async ({ acl, query }) => {
    const payload = validator.validate(query, schemas.pagination.schema)

    acl.authorize('read', 'File')

    return await File.paginate({
        limit: payload.limit,
        page: payload.page,
        query: qb => qb.selectAll().where(undeleted)
            .orderBy('created_at', 'desc'),
    })
})

router.post('/upload', async ({ upload, query  }) => {
    const file = await upload.single('file')

    if (!file) {
        throw new BaseException('No file provided')
    }

    let currentDrive = drive

    if (query.drive) {
        currentDrive = drive.use(query.drive as string)
    }

    const entity = await currentDrive.createFile(file.buffer, file.originalname)

    return entity
})


router.get('/:id', async ({ acl, params }) => {
    const id = validator.validate(params.id, schemas.query.number)

    console.log('Fetching file with ID:', id)  // Debug log

    const file = await File.find(id)

    acl.authorize('read', file)

    return file
})

router.get('/:id/stream', async ({ acl, params, response }) => {
    const file = await File.findOrFail({
        query: qb => qb.selectAll()
            .where(undeleted)
            .where('id', '=', Number(params.id)),
    })

    acl.authorize('read', file)

    if (!file.drive) {
        throw new BaseException('File has no associated drive', 500)
    }

    const driveInstance = drive.use(file.drive)
    const exists = await driveInstance.exists(file.filename)

    if (!exists) {
        throw new BaseException('File not found on storage', 404)
    }

    const data = await driveInstance.read(file.filename)

    response.set('Content-Type', file.mimetype || 'application/octet-stream')
    response.set('Content-Length', String(data.length))
    response.set('Content-Disposition', `inline; filename="${file.client_name}"`)

    return data
})