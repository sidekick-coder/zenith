import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import BaseException from '#server/exceptions/base.ts'
import db from '#server/facades/db.facade.ts'
import Role from '#server/entities/role.entity.ts'
import validator from '#shared/services/validator.service.ts'

export default defineAuthHandler(async ({ body, acl }) => {
    acl.authorize('create', 'Role')

    const payload = validator.validate(body, v => v.object({
        name: v.pipe(v.string(), v.minLength(3)),
        description: v.optional(v.string()),
    }))

    const row = await db.insertInto('roles').values(payload)
        .returningAll()
        .executeTakeFirst()

    if (!row) {
        throw new BaseException('Failed to create role', 500)
    }

    return new Role(row)
})
