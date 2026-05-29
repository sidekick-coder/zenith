import { config, userRepository  } from '@sidekick-coder/zenith-kit/server'
import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import { validator, userSchema } from '@sidekick-coder/zenith-kit/shared'

export default defineHandler(async (ctx) => {
    ctx.acl.authorize('create', 'User')

    const validated = validator.validate(ctx.body, userSchema.create())

    const payload: any = { ...validated }

    const needVerifyEmail = config.get('auth.enable_email_verification', false)

    if (!needVerifyEmail) {
        payload.verified_at = new Date().toISOString()
    }

    const user = await userRepository.create(payload)

    return user
})
