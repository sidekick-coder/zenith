import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import { destroy } from '#server/queries/index.ts'
import Permission from '#shared/entities/permission.entity.ts'

export default defineAuthHandler(async ({ acl, params }) => {
    acl.authorize('delete', 'PermissionAssignment')

    await destroy('permissions_assignments', {
        serialize: Permission.from,
        query: qb => qb.where('id', '=', Number(params.id))
    })

    return { success: true, }
})
