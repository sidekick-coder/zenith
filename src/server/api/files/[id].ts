import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import File from '#server/entities/file.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'

export default defineAuthHandler(async ({ acl, params }) => {
    const id = validator.validate(params.id, schemas.query.number)
    const file = await File.find(id)

    acl.authorize('read', file)

    return file
})
