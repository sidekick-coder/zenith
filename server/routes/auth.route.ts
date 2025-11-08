import router from '#server/facades/router.facade.ts'
import auth from '#server/facades/auth.facade.ts'
import BaseException from '#server/exceptions/base.ts'
import validator from '#shared/services/validator.service.ts'
import config from '#server/facades/config.facade.ts'

router.post('/api/auth/login', async ({ body, cookie }) => {
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

router.post('/api/auth/register', async ({ body, cookie }) => {

    if (!config.get('auth.enableSignUp', false)) {
        throw new BaseException('Registration is disabled', 403)
    }

    const token = cookie.get('Authorization')
    const user = await auth.authenticate(token)

    if (user) {
        throw new BaseException('Already logged in', 400)
    }

    const credentials = validator.validate(body, v => v.object({
        username: v.string(),
        email: v.string(),
        password: v.string(),
    }))

    const result = await auth.register(credentials)

    if (!result.success) {
        throw new BaseException(result.message, 400)
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
