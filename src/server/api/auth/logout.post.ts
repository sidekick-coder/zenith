import { BaseException } from '@sidekick-coder/zenith-kit/shared'
import { defineHandler } from '@sidekick-coder/zenith-kit/server'

export default defineHandler(async ({ cookie }) => {
    if (!cookie.get('Authorization')) {
        throw new BaseException('Not logged in', 400)
    }

    cookie.set('Authorization', '', {
        httpOnly: true,
        sameSite: true,
        expires: new Date(0),
    })

    return {
        success: true,
        message: 'Logged out',
    }
})
