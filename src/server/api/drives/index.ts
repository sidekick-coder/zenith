import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import DriveConfig from '#server/entities/driveConfig.entity.ts'

export default defineAuthHandler(async ({ acl }) => {
    acl.authorize('manage', 'Config', { key: 'drive.disks' })

    const items = await DriveConfig.list()

    return {
        page: 1,
        total: items.length,
        total_pages: 1,
        items,
    }
})
