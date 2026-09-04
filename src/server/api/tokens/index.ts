import { validator } from '@sidekick-coder/zenith-kit/shared'
import type { HttpContext } from '#server/contracts/httpContext.contract.ts'
import tokenRepository from '#server/facades/tokenRepository.ts'
import { loadUser } from '#server/loaders/createUserLoader.ts'

export default async function({ acl, query }: HttpContext) {
    acl.authorize('list', 'Token')

    const payload = validator.validate(query, v => v.object({
        page: v.optional(v.extras.url.number()),
        limit: v.optional(v.extras.url.number()),
        type: v.optional(v.extras.url.array(v.string())),
        search: v.optional(v.string()),
        with: v.optional(v.extras.url.array(v.string())),
    }))

    const pagination = await tokenRepository.paginate(payload)

    for (const token of pagination.items) {
        token.token = '[REDACTED]'
    }

    if (payload.with?.includes('user')) {
        await loadUser(pagination.items)
    }

    return pagination
}
