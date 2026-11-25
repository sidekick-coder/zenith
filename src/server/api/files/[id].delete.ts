import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import File from '#server/entities/file.entity.ts'
import { undeleted } from '#server/queries/index.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'

export default defineAuthHandler(async ({ params, acl }) => {
    const id = validator.validate(params.id, schemas.query.number())

    const file = await File.findOneOrFail({
        query: q => q
            .where('id', '=', id)
            .where(undeleted)
            .selectAll()
    })

    acl.authorize('delete', file)

    await file.softDelete()

    return { success: true, }
})
