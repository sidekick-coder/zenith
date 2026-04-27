import { validator } from '@sidekick-coder/zenith-kit/shared'
import type { HttpContext } from '#server/contracts/httpContext.contract.ts'
import tokenRepository from '#server/facades/tokenRepository.ts'
import permissionRepository from '#server/facades/permissionRepository.ts'
import permissionAssignmentRepository from '#server/facades/permissionAssignmentRepository.ts'

export default async function({ acl, params, query }: HttpContext) {

    const id = validator.validate(params.id, v => v.extras.url.number())

    const payload = validator.validate(query, v => v.object({ delete_permissions: v.optional(v.extras.url.boolean(), false), }))

    const token = await tokenRepository.findByIdOrFail(id)

    acl.authorize('delete', 'Token', token)

    const assignments = await permissionAssignmentRepository.findMany({
        assignableId: String(id),
        assignableType: 'token'
    })

    if (payload.delete_permissions) {
        await permissionRepository.deleteMany({ id: assignments.map(a => a.permission_id) })
    }

    // only delete assignments if we're not deleting permissions, otherwise the cascade will handle it
    if (!payload.delete_permissions) {
        await permissionAssignmentRepository.deleteMany({
            assignableId: String(id),
            assignableType: 'token'
        })
    }

    await tokenRepository.deleteById(id)
}
