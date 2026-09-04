import type { HttpContext } from '#server/contracts/httpContext.contract.ts'
import tokenRepository from '#server/facades/tokenRepository.ts'

export default async function({ acl, params }: HttpContext) {
    acl.authorize('read', 'Token')

    const token = await tokenRepository.findByIdOrFail(params.id)

    token.token = '[REDACTED]'

    return token
}
