import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import BaseException from '#server/exceptions/base.ts'
import { undeleted, update } from '#server/queries/index.ts'
import Permission from '#shared/entities/permission.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'

export default defineAuthHandler(async ({ acl, params, body }) => {
    acl.authorize('update', 'Permission')

    const data = await validator.validate(body, schemas.permission.update)

    const permissions = await update('permissions', {
        serialize: Permission.from,
        where: qb => qb.and([
            undeleted(qb),
            qb('id', '=', Number(params.id)),
        ]),
        values: {
            name: data.name,
            description: data.description,
            action: data.action,
            subject: data.subject,
            conditions: data.conditions ? JSON.stringify(data.conditions) : null,
        }
    })

    if (permissions.length === 0) {
        throw new BaseException('Permission not found', 404)
    }

    return permissions[0]
})
