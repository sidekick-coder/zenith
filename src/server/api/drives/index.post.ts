import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import DriveConfig from '#server/entities/driveConfig.entity.ts'
import drive from '#server/facades/drive.facade.ts'

export default defineAuthHandler(async ({ acl, body }) => {
    acl.authorize('manage', 'Config', { key: 'drive.disks' })

    await DriveConfig.create(body)
    await drive.load()

    return { message: 'Resource created successfully' }
})
