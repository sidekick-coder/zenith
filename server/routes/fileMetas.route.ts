import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import FileMeta from '#server/entities/fileMeta.entity.ts'
import File from '#server/entities/file.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'
import { undeleted } from '#server/queries/index.ts'

const router = rootRouter.use(authMiddleware)
    .prefix('/api/files/:fileId/metas')
    .group()

router.get('/', async ({ params, acl, query }) => {
    const fileId = validator.validate(params.fileId, schemas.query.number)
    const file = await File.findOneOrFail({
        query: q => q.where('id', '=', fileId)
            .where(undeleted)
            .selectAll()
    })

    acl.authorize('read', file)

    const payload = validator.validate(query, schemas.pagination.schema)

    const pagination = await FileMeta.paginate({
        page: payload.page,
        limit: payload.limit,
        query: q => q.selectAll()
            .where('file_id', '=', fileId)
            .where(undeleted)
            .orderBy('created_at', 'desc')
    })

    return pagination
})

router.get('/:id', async ({ params, acl }) => {
    const fileId = validator.validate(params.fileId, schemas.query.number)
    const metaId = validator.validate(params.id, schemas.query.number)

    const file = await File.findOneOrFail({
        query: q => q.where('id', '=', fileId)
            .where(undeleted)
            .selectAll()
    })

    acl.authorize('read', file)

    const fileMeta = await FileMeta.findOneOrFail({
        query: q => q.where('id', '=', metaId)
            .where('file_id', '=', fileId)
            .where(undeleted)
            .selectAll()
    })

    return fileMeta
})

router.post('/', async ({ params, body, acl }) => {
    const fileId = validator.validate(params.fileId, schemas.query.number)
    
    const file = await File.findOneOrFail({
        query: q => q.where('id', '=', fileId)
            .where(undeleted)
            .selectAll()
    })

    acl.authorize('update', file)

    const payload = validator.validate(body, schemas.fileMeta.create)

    const fileMeta = await FileMeta.create({
        file_id: fileId,
        name: payload.name,
        value: payload.value
    })

    return fileMeta
})

router.put('/:id', async ({ params, body, acl }) => {
    const fileId = validator.validate(params.fileId, schemas.query.number)
    const metaId = validator.validate(params.id, schemas.query.number)

    const file = await File.findOneOrFail({
        query: q => q.where('id', '=', fileId)
            .where(undeleted)
            .selectAll()
    })

    acl.authorize('update', file)

    const fileMeta = await FileMeta.findOneOrFail({
        query: q => q.where('id', '=', metaId)
            .where('file_id', '=', fileId)
            .where(undeleted)
            .selectAll()
    })

    const payload = validator.validate(body, schemas.fileMeta.update)

    await FileMeta.updateById(metaId, payload)

    fileMeta.merge(payload)

    return fileMeta
})

router.delete('/:id', async ({ params, acl }) => {
    const fileId = validator.validate(params.fileId, schemas.query.number)
    const metaId = validator.validate(params.id, schemas.query.number)

    const file = await File.findOneOrFail({
        query: q => q.where('id', '=', fileId)
            .where(undeleted)
            .selectAll()
    })

    acl.authorize('update', file)

    const fileMeta = await FileMeta.findOneOrFail({
        query: q => q.where('id', '=', metaId)
            .where('file_id', '=', fileId)
            .where(undeleted)
            .selectAll()
    })

    await fileMeta.softDelete()

    return fileMeta
})