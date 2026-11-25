import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import config from '@sidekick-coder/zenith-kit/server/facades/config'
import BaseException from '#server/exceptions/base.ts'
import env from '#server/facades/env.facade.ts'
import OauthToken from '#server/entities/oauthToken.entity.ts'
import validator from '#shared/services/validator.service.ts'

export default defineHandler(async ({ body, user }) => {
    const { action, provider, error_url, success_url } = validator.validate(body, v => v.object({
        action: v.picklist(['login', 'register', 'connect']),
        provider: v.picklist(['google']),
        error_url: v.optional(v.string(), '/error'),
        success_url: v.optional(v.string(), '/')
    }))

    if (provider === 'google' && !config.get('oauth.google_enabled', false)) {
        throw new BaseException('Google OAuth is disabled', 403)
    }

    const url = new URL('https://accounts.google.com/o/oauth2/auth')
    const redirectURI = new URL('/api/oauth/google', env.get('ZENITH_APP_URL'))

    url.searchParams.append('client_id', config.get('oauth.google_client_id', ''))
    url.searchParams.append('redirect_uri', redirectURI.toString())
    url.searchParams.append('access_type', 'offline')
    url.searchParams.append('response_type', 'code')
    url.searchParams.append('prompt', 'consent')
    url.searchParams.append(
        'scope',
        [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
            'openid',
        ].join(' ')
    )

    const token = await OauthToken.generate({
        provider,
        action,
        user_id: user ? user.id : undefined,
        metadata: {
            error_url,
            success_url,
        }
    })

    url.searchParams.append('state', token.token)

    return { url: url.toString(), }
})
