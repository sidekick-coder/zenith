import { BaseException } from '@sidekick-coder/zenith-kit/shared'
import { defineHandler, config } from '@sidekick-coder/zenith-kit/server'
import auth from '#server/facades/auth.facade.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'

export default defineHandler(async ({ body, cookie }) => {
    if (!config.get('auth.enable_registration', false)) {
        throw new BaseException('Registration is disabled', 403)
    }

    const token = cookie.get('Authorization')
    const user = await auth.authenticate(token)

    if (user) {
        throw new BaseException('Already logged in', 403)
    }

    const credentials = validator.validate(body, schemas.user.create)
    const result = await auth.register(credentials)

    if (!result.success) {
        throw new BaseException(result.message, 400)
    }

    return result
})
