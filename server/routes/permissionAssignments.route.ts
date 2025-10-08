import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import { undeleted, firstOrCreate, destroy, paginate, list } from '#server/queries/index.ts'
import Permission from '#shared/entities/permission.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'

const router = rootRouter.use(authMiddleware)
    .prefix('/api/permission-assignments')
    .group()

router.get('/', async ({ acl, query }) => {
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

router.post('/', async ({ acl, body }) => {
    acl.authorize('create', 'PermissionAssignment')

    const payload = await validator.validate(body, schemas.permissionAssignment.create)

    const assignment = await firstOrCreate('permissions_assignments', {
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

    return assignment
})

router.delete('/:id', async ({ acl, params }) => {
    acl.authorize('delete', 'PermissionAssignment')

    await destroy('permissions_assignments', {
        serialize: Permission.from,
        query: qb => qb.where('id', '=', Number(params.id))
    })

    return {
        success: true
    }
})