import * as v from 'valibot'
import validator from '#shared/services/validator.service.ts'
import type { HttpContext } from '#server/contracts/httpContext.contract.ts'
import tokenRepository from '#server/facades/tokenRepository.ts'

export default async function({ acl, params, body }: HttpContext) {
    acl.authorize('update', 'Token')

    const payload = validator.validate(body, v.object({
        name: v.pipe(v.string(), v.minLength(1)),
    }))

    await tokenRepository.updateById(params.id, { name: payload.name })

    const token = await tokenRepository.findByIdOrFail(params.id)

    token.token = '[REDACTED]'

    return token
}
