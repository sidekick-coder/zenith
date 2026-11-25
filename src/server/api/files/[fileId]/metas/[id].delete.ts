import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import FileMeta from '#server/entities/fileMeta.entity.ts'
import File from '#server/entities/file.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'
import { undeleted } from '#server/queries/index.ts'

export default defineAuthHandler(async ({ params, acl }) => {
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
