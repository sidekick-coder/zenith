import { validator } from '@sidekick-coder/zenith-kit/shared'
import type { HttpContext } from '#server/contracts/httpContext.contract.ts'
import tokenRepository from '#server/facades/tokenRepository.ts'
import { loadPermissions } from '#server/loaders/createPermissionLoader.ts'
import permissionRepository from '#server/facades/permissionRepository.ts'

export default async function({ acl, params }: HttpContext) {
    acl.authorize('delete', 'Token')

    const id = validator.validate(params.id, v => v.extras.url.number())

    const token = await tokenRepository.findByIdOrFail(id)

    await loadPermissions(token, { assignType: 'token' })

    const permissionIds = (token.permissions || []).map(p => p.id)

    await permissionRepository.deleteMany({ id: permissionIds })

    await tokenRepository.deleteById(id)
}
