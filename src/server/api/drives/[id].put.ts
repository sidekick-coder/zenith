import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import DriveConfig from '#server/entities/driveConfig.entity.ts'
import drive from '#server/facades/drive.facade.ts'
import validator from '#shared/services/validator.service.ts'

export default defineAuthHandler(async ({ acl, params, body }) => {
    acl.authorize('manage', 'Config', { key: 'drive.disks' })

    const id = validator.validate(params.id, v => v.string())

    await DriveConfig.update(id, body)
    await drive.load()

    return DriveConfig.findOrFail(id)
})
