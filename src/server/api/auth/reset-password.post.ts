import { BaseException } from '@sidekick-coder/zenith-kit/shared'
import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import { auth } from '@sidekick-coder/zenith-kit/server'
import validator from '#shared/services/validator.service.ts'

export default defineHandler(async ({ body }) => {
    const data = validator.validate(body, v => v.object({
        token: v.string(),
        password: v.pipe(v.string(), v.minLength(6)),
    }))

    const success = await auth.resetPassword(data.token, data.password)

    if (!success) {
        throw new BaseException($t('Invalid or expired password reset token'), 400)
    }

    return {
        success: true,
        message: $t('Password reset successful'),
    }
})
