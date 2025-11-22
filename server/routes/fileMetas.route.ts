import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import FileMeta from '#server/entities/fileMeta.entity.ts'
import File from '#server/entities/file.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'
import { undeleted } from '#server/queries/index.ts'
import db from '#server/facades/db.facade.ts'

const router = rootRouter.use(authMiddleware)
    .prefix('/api/files/:fileId/metas')
    .group()

rootRouter.use(authMiddleware).get('/api/file-metas', async ({ acl, query: routeQuery }) => {
    acl.authorize('read', 'FileMeta')

    const payload = validator.validate(routeQuery, v => v.intersect([
        schemas.pagination.schema,
        v.object({
            file_id: v.optional(schemas.query.number()),
            name: v.optional(v.string()),
            value: v.optional(v.string()),
        })
    ]))

    let query = db.selectFrom('file_metas as fm')
        .selectAll('fm')
        .innerJoin('files as f', 'fm.file_id', 'f.id')
        .where(undeleted.column('fm.deleted_at'))
        .where(undeleted.column('f.deleted_at'))
        .orderBy('fm.created_at', 'desc')

    if (payload.file_id) {
        query = query.where('fm.file_id', '=', payload.file_id)
    }

    if (payload.name) {
        query = query.where('fm.name', '=', payload.name)
    }

    if (payload.value) {
        query = query.where('fm.value', '=', payload.value)
    }

    return FileMeta.paginate({
        page: payload.page,
        limit: payload.limit,
        query: () => query
    })
})

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