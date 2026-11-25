import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import drive from '#server/facades/drive.facade.ts'
import validator from '#shared/services/validator.service.ts'

export default defineAuthHandler(async ({ acl, params, query }) => {
    const id = validator.validate(params.id, v => v.string())
    const current = drive.use(id)

    acl.authorize('read', 'Drive', current)

    return current.list(query.folder as string)
})
