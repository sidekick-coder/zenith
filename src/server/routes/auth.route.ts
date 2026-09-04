import { BaseException } from '@sidekick-coder/zenith-kit/shared'
import config from '@sidekick-coder/zenith-kit/server/facades/config'
import router from '#server/facades/router.facade.ts'
import auth from '#server/facades/auth.facade.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'
import env from '#server/facades/env.facade.ts'

router.post('/api/auth/login', async ({ body, cookie }) => {
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

    const options = {
        httpOnly: true,
        sameSite: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }

    cookie.set('Authorization', result.token!, options)

    return result
})

router.post('/api/auth/register', async ({ body, cookie }) => {

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

router.post('/api/auth/forget-password', async ({ body }) => {
    const data = validator.validate(body, v => v.object({ email: v.pipe(v.string(), v.email()), }))

    await auth.forgetPassword(data.email)

    return {
        success: true,
        message: $t('Password reset email sent')
    }
})

router.post('/api/auth/reset-password', async ({ body }) => {
    const data = validator.validate(body, v => v.object({
        token: v.string(),
        password: v.pipe(v.string(), v.minLength(6)),
    }))

    const success = await auth.resetPassword(data.token, data.password)

    if (!success) {
        throw new BaseException($t('Invalid or expired password reset token'), 400)
    }

    return {
        success: true,
        message: $t('Password reset successful')
    }
})

router.get('/api/auth/verify-email', async ({ query, response }) => {
    const token = validator.validate(query.token, v => v.string())

    const result = await auth.verifyEmail(token)

    const url = new URL('/auth/message', env.get('APP_URL'))

    if (!result) {
        url.searchParams.append('title', $t('Email Verification Failed'))
        url.searchParams.append('message', $t('Invalid or expired email verification token'))

        response.redirect(url.toString())
        return
    }

    url.searchParams.append('title', $t('Email Verified'))
    url.searchParams.append('message', $t('Email verified successfully'))

    response.redirect(url.toString())

    return
})
