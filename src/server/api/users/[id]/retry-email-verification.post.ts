import { userRepository  } from '@sidekick-coder/zenith-kit/server'
import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import { BaseException, validator } from '@sidekick-coder/zenith-kit/shared'
import auth from '#server/facades/auth.facade.ts'

export default defineHandler(async ({ params, acl }) => {
    const id = validator.validate(params.id, v => v.extras.number())

    const user = await userRepository.findByIdOrFail(id)

    acl.authorize('update', 'User', user)

    if (user.verified_at) {
        throw new BaseException('User is already verified', 400)
    }

    await auth.sendVerifyEmail(user.email)
})
