import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import auth from '#server/facades/auth.facade.ts'
import validator from '#shared/services/validator.service.ts'

export default defineHandler(async ({ body }) => {
    const data = validator.validate(body, v => v.object({ email: v.pipe(v.string(), v.email()), }))

    await auth.forgetPassword(data.email)

    return {
        success: true,
        message: $t('Password reset email sent'),
    }
})
