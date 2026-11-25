import { BaseException } from '@sidekick-coder/zenith-kit/shared'
import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import { auth } from '@sidekick-coder/zenith-kit/server'
import validator from '#shared/services/validator.service.ts'

export default defineHandler(async ({ body, cookie }) => {
    const token = cookie.get('Authorization')
    const user = await auth.authenticate(token)

    if (user) {
        throw new BaseException('Already logged in', 403)
    }

    const credentials = validator.validate(body, v => v.object({
        uuid: v.string(),
        password: v.string(),
    }))

    const result = await auth.login(credentials)

    if (!result.success) {
        throw new BaseException(result.message, 401)
    }

    cookie.set('Authorization', result.token!, {
        httpOnly: true,
        sameSite: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    })

    return result
})
