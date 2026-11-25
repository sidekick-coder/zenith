import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import { create } from '#server/queries/index.ts'
import Permission from '#shared/entities/permission.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'

export default defineAuthHandler(async ({ acl, body }) => {
    acl.authorize('create', 'Permission')

    const data = await validator.validate(body, schemas.permission.create)

    return create('permissions', {
        serialize: Permission.from,
        values: {
            name: data.name,
            description: data.description,
            origin: 'custom',
            action: data.action,
            subject: data.subject,
            conditions: data.conditions ? JSON.stringify(data.conditions) : null,
        }
    })
})
