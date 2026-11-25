import { defineHandler, env } from '@sidekick-coder/zenith-kit/server'
import auth from '#server/facades/auth.facade.ts'
import validator from '#shared/services/validator.service.ts'

export default defineHandler(async ({ query, response }) => {
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
})
