import { userRepository  } from '@sidekick-coder/zenith-kit/server'
import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'

export default defineHandler(async (ctx) => {
    const id = validator.validate(ctx.params.id, v => v.extras.number())

    const user = await userRepository.findByIdOrFail(id)

    ctx.acl.authorize('delete', 'User', user)

    const deletedAt = new Date().toISOString()

    await userRepository.updateById(id, { deleted_at: deletedAt })

    user.deleted_at = deletedAt

    return user
})
