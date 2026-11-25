import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import { firstOrCreate } from '#server/queries/index.ts'
import Permission from '#shared/entities/permission.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'

export default defineAuthHandler(async ({ acl, body }) => {
    acl.authorize('create', 'PermissionAssignment')

    const payload = await validator.validate(body, schemas.permissionAssignment.create)

    return firstOrCreate('permissions_assignments', {
        serialize: Permission.from,
        select: qb => qb
            .selectAll()
            .where('assignable_id', '=', payload.assign_id)
            .where('assignable_type', '=', payload.assign_type)
            .where('permission_id', '=', payload.permission_id),
        values: {
            assignable_id: payload.assign_id,
            assignable_type: payload.assign_type,
            permission_id: payload.permission_id,
        },
    })
})
