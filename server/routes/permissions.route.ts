import BaseException from '#server/exceptions/base.ts'
import db from '#server/facades/db.facade.ts'
import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import { list, paginate, undeleted } from '#server/queries/index.ts'
import Permission from '#shared/entities/permission.entity.ts'
import Role from '#shared/entities/role.entity.ts'
import validator from '#shared/services/validator.service.ts'

const router = rootRouter.use(authMiddleware)
    .prefix('/api/permissions')
    .group()

router.get('/', async ({ acl }) => {
    acl.authorize('read', 'Permission')
    
    const pagination = await paginate('permissions', {
        serialize: Permission.from,
        query: qb => qb.selectAll().where(undeleted),
    })

    return pagination
})