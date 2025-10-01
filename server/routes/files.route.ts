import { randomUUID } from 'crypto'
import mime from 'mime'
import File from '#server/entities/file.entity.ts'
import BaseException from '#server/exceptions/base.ts'
import drive from '#server/facades/drive.facade.ts'
import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import { update, create, findOrFail, paginate, undeleted, softDelete } from '#server/queries/index.ts'
import Permission from '#shared/entities/permission.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'
import files from '#server/facades/files.facade.ts'

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

router.post('/upload', async (ctx) => {
    const file = await ctx.file('file')

    if (!file) {
        throw new BaseException('No file provided')
    }

    const entity = files.fromFile({
        file,
        drive: ctx.query.drive as string | undefined,
        metadata: ctx.query.metadata as any,
    })

    return entity
})


router.get('/:id', async ({ acl, params }) => {
    const file = await File.findOrFail({
        query: qb => qb.selectAll()
            .where(undeleted)
            .where('id', '=', Number(params.id)),
    })

    acl.authorize('read', file)

    return file
})

