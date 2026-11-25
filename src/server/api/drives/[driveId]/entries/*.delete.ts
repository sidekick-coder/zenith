import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import drive from '#server/facades/drive.facade.ts'
import validator from '#shared/services/validator.service.ts'

export default defineAuthHandler(async ({ acl, params }) => {
    const filename = validator.validate(params['*'], v => v.string())
    const id = validator.validate(params.driveId, v => v.string())
    const current = drive.use(id)

    acl.authorize('delete', 'DriveEntry', { filename })
    await current.delete(filename)

    return { success: true }
})
