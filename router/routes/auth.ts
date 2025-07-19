import router from '#facades/router.ts'
import auth from '#facades/auth.ts'
import BaseException from '#exceptions/base.ts'

router.post('/auth/login', async ({ body }) => {
    const credentials = body as { email: string; password: string }

    const result = await auth.login(credentials)

    if (!result.success) {
        throw new BaseException(result.message, 401)
    }

    return {
        success: true,
        message: result.message,
        user: result.user
    }
})