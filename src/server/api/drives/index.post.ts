import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import { drive } from '@sidekick-coder/zenith-kit/server'
import DriveConfig from '#server/entities/driveConfig.entity.ts'

export default defineAuthHandler(async ({ acl, body }) => {
    acl.authorize('manage', 'Config', { key: 'drive.disks' })

    await DriveConfig.create(body)
    await drive.load()

    return { message: 'Resource created successfully' }
})
