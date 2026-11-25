import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import BaseException from '#server/exceptions/base.ts'
import { findOneOrFail, undeleted } from '#server/queries/index.ts'
import Permission from '#shared/entities/permission.entity.ts'

export default defineAuthHandler(async ({ acl, params }) => {
    acl.authorize('read', 'Permission')

    const permission = await findOneOrFail('permissions', {
        serialize: Permission.from,
        where: qb => qb.and([
            undeleted(qb),
            qb('id', '=', Number(params.id)),
        ])
    })

    if (!permission) {
        throw new BaseException('Permission not found', 404)
    }

    return permission
})
