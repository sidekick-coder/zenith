import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import BaseException from '#server/exceptions/base.ts'
import { softDelete, undeleted } from '#server/queries/index.ts'
import Permission from '#shared/entities/permission.entity.ts'

export default defineAuthHandler(async ({ acl, params }) => {
    acl.authorize('delete', 'Permission')

    const permissions = await softDelete('permissions', {
        serialize: Permission.from,
        query: qb => qb.where(undeleted).where('id', '=', Number(params.id)),
    })

    if (permissions.length === 0) {
        throw new BaseException('Permission not found', 404)
    }

    return permissions[0]
})
