import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import DatabaseConnection from '#server/entities/databaseConnection.entity.ts'

export default defineAuthHandler(async ({ acl }) => {
    acl.authorize('read', 'Config', { key: 'database.connections' })

    const items = await DatabaseConnection.list()

    return {
        page: 1,
        total: items.length,
        total_pages: 1,
        items,
    }
})
