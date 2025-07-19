import router from '#facades/router.ts'
import auth from '#facades/auth.ts'
import BaseException from '#exceptions/base.ts'

router.post('/auth/login', async ({ body, cookie }) => {
    if (cookie.get('token')) {
        throw new BaseException('Already logged in', 400)
    }

    const credentials = body as { email: string; password: string }

    const result = await auth.login(credentials)

    if (!result.success) {
        throw new BaseException(result.message, 401)
    }

    cookie.set('token', result.token!, {
        httpOnly: true,
        sameSite: true,
    })

    return result
})