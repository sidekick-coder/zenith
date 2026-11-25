import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import { list, paginate, undeleted } from '#server/queries/index.ts'
import Permission from '#shared/entities/permission.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'

export default defineAuthHandler(async ({ acl, query }) => {
    const payload = await validator.validate(query, schemas.permissionAssignment.index)

    acl.authorize('read', 'PermissionAssignment', {
        assignable_type: payload.assign_type,
        assignable_id: payload.assign_id,
    })

    const pagination = await paginate('permissions_assignments', {
        query: qb => qb.selectAll()
            .where('assignable_type', '=', payload.assign_type)
            .where('assignable_id', '=', payload.assign_id)
            .orderBy('id', 'desc'),
    })

    if (!pagination.items.length) {
        return pagination
    }

    const permissions = await list('permissions', {
        serialize: Permission.from,
        query: qb => qb.selectAll()
            .where(undeleted)
            .where('id', 'in', pagination.items.map(i => Number(i.permission_id)))
    })

    pagination.items.map(item => {
        item.permission = permissions.find(p => p.id === item.permission_id)
    })

    return pagination
})
