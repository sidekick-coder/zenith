import { userRepository  } from '@sidekick-coder/zenith-kit/server'
import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'

export default defineHandler(async (ctx) => {
    ctx.acl.authorize('list', 'User')

    const payload = validator.validate(ctx.query, v => v.intersect([
        v.extras.pagination(),
        v.object({ search: v.optional(v.string()), })
    ]))

    return userRepository.paginate(payload)
})
