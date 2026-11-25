import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import DatabaseConnection from '#server/entities/databaseConnection.entity.ts'
import validator from '#shared/services/validator.service.ts'

export default defineAuthHandler(async ({ acl, params }) => {
    acl.authorize('read', 'Config', { key: 'database.connections' })

    const id = validator.validate(params.id, v => v.string())

    return DatabaseConnection.findOrFail(id)
})
