import router from '#facades/router.ts'
import auth from '#facades/auth.ts'
import BaseException from '#exceptions/base.ts'

router.post('/auth/login', async ({ body, cookie }) => {
    const token = cookie.get('Authorization')
    const user = await auth.authenticate(token)

    if (user) {
        throw new BaseException('Already logged in', 400)
    }

    const credentials = body as { email: string; password: string }

    const result = await auth.login(credentials)

    if (!result.success) {
        throw new BaseException(result.message, 401)
    }

    cookie.set('Authorization', result.token!, {
        httpOnly: true,
        sameSite: true,
    })

    return result
})

router.post('/auth/logout', async ({ cookie }) => {
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
        message: 'Logged out' 
    }
})