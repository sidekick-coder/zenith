import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import FileMeta from '#server/entities/fileMeta.entity.ts'
import File from '#server/entities/file.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'
import { undeleted } from '#server/queries/index.ts'

export default defineAuthHandler(async ({ params, acl, query }) => {
    const fileId = validator.validate(params.fileId, schemas.query.number)
    const file = await File.findOneOrFail({
        query: q => q.where('id', '=', fileId)
            .where(undeleted)
            .selectAll()
    })

    acl.authorize('read', file)

    const payload = validator.validate(query, schemas.pagination.schema)

    return FileMeta.paginate({
        page: payload.page,
        limit: payload.limit,
        query: q => q.selectAll()
            .where('file_id', '=', fileId)
            .where(undeleted)
            .orderBy('created_at', 'desc')
    })
})
