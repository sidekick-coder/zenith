import router from '#server/facades/router.facade.ts'
import auth from '#server/facades/auth.facade.ts'
import BaseException from '#server/exceptions/base.ts'
import validator from '#server/services/validator.service.ts'

router.post('/auth/login', async ({ body, cookie }) => {
    const token = cookie.get('Authorization')
    const user = await auth.authenticate(token)

    if (user) {
        throw new BaseException('Already logged in', 400)
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
