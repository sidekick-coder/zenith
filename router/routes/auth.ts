import router from '#facades/router.ts'
import auth from '#facades/auth.ts'

router.post('/auth/login', async ({ body }) => {
    const credentials = body as { email: string; password: string }

    const result = await auth.login(credentials)

    if (!result.success) {
        return {
            error: true,
            message: result.message
        }
    }

    return {
        success: true,
        message: result.message,
        user: result.user
    }
})