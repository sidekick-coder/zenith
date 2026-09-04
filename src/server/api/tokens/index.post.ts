import { randomBytes } from 'crypto'
import * as v from 'valibot'
import validator from '#shared/services/validator.service.ts'
import type { HttpContext } from '#server/contracts/httpContext.contract.ts'
import tokenRepository from '#server/facades/tokenRepository.ts'
import { create } from '#server/queries/index.ts'

export default async function({ acl, body, user }: HttpContext) {
    acl.authorize('create', 'Token')

    const payload = validator.validate(body, v.object({
        name: v.pipe(v.string(), v.minLength(1)),
        permission_ids: v.optional(v.array(v.number()), []),
    }))

    const token = randomBytes(32).toString('hex')

    const created = await tokenRepository.create({
        user_id: user.id,
        name: payload.name,
        token,
        type: 'api',
    })

    for (const permission_id of payload.permission_ids) {
        await create('permissions_assignments', {
            values: {
                assignable_type: 'token',
                assignable_id: created.id,
                permission_id,
            },
        })
    }

    return {
        ...created,
        token 
    }
}
