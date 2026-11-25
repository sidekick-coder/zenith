import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import DriveConfig from '#server/entities/driveConfig.entity.ts'
import validator from '#shared/services/validator.service.ts'

export default defineAuthHandler(async ({ acl, params }) => {
    acl.authorize('manage', 'Config', { key: 'drive.disks' })

    const id = validator.validate(params.id, v => v.string())

    return DriveConfig.findOrFail(id)
})
