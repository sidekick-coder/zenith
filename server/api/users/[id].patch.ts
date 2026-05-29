import { userRepository  } from '@sidekick-coder/zenith-kit/server'
import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import { userSchema, validator } from '@sidekick-coder/zenith-kit/shared'

export default defineHandler(async (ctx) => {
    const id = validator.validate(ctx.params.id, v => v.extras.number())
    const payload = validator.validate(ctx.body, userSchema.update())

    let user = await userRepository.findByIdOrFail(id)

    ctx.acl.authorize('update', 'User', user)

    await userRepository.updateById(id, payload)

    user = await userRepository.findByIdOrFail(id)

    return user
})
