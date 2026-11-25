import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import { drive } from '@sidekick-coder/zenith-kit/server'
import validator from '#shared/services/validator.service.ts'

export default defineAuthHandler(async ({ acl, params, response }) => {
    const filename = validator.validate(params['*'], v => v.string())
    const id = validator.validate(params.id, v => v.string())
    const current = drive.use(id)

    acl.authorize('read', 'DriveEntry', { filename })

    response.redirect(await current.url(filename, { expires: '15m' }))
})
