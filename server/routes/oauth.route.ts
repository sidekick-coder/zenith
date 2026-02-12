import { randomBytes } from 'crypto'
import rootRouter from '#server/facades/router.facade.ts'
import BaseException from '#server/exceptions/base.ts'
import validator from '#shared/services/validator.service.ts'
import config from '#server/facades/config.facade.ts'
import env from '#server/facades/env.facade.ts'
import OauthToken from '#server/entities/oauthToken.entity.ts'
import OauthAccount from '#server/entities/oauthAccount.entity.ts'
import { undeleted } from '#server/queries/softDelete.ts'
import User from '#server/entities/user.entity.ts'
import auth from '#server/facades/auth.facade.ts'

const router = rootRouter.prefix('/api/oauth').group()

router.post('/', async ({ body, user }) => {
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
    const redirectURI = new URL('/api/oauth/google', env.get('APP_URL'))

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

    return {
        url: url.toString(),
    }
})

router.get('/google', async ({ query, response, cookie }) => {

    const code = query.code 
    const state = query.state

    let errorUrl = new URL('/errors/oauth', env.get('APP_URL'))

    errorUrl.searchParams.append('title', $t('OAuth Error'))
    errorUrl.searchParams.append('message', $t('There was an error during the OAuth process. Please try again or contact support.'))

    if (!code || !state) {
        response.redirect(errorUrl.toString())
        return
    }

    const oauthToken = await OauthToken.findOne({
        where: eb => eb.and({
            provider: 'google',
            token: state,
        })
    })

    if (!oauthToken) {
        response.redirect(errorUrl.toString())
        return
    }

    // await oauthToken.destroy()

    if (oauthToken.metadata.error_url) {
        errorUrl = new URL(oauthToken.metadata.error_url, env.get('APP_URL'))
    }

    const successUrl = new URL(oauthToken.metadata.success_url || '/', env.get('APP_URL'))

    const credentials = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        body: new URLSearchParams({
            code,
            client_id: config.get('oauth.google_client_id', ''),
            client_secret: config.get('oauth.google_client_secret', ''),
            redirect_uri: new URL('/api/oauth/google', env.get('APP_URL')).toString(),
            grant_type: 'authorization_code',
        }),
    }).then((res) => res.json() as any)

    if (!credentials.access_token) {
        response.redirect(errorUrl.toString())
        return
    }

    const googleUser = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
            Authorization: `Bearer ${credentials.access_token}`,
        },
    }).then((res) => res.json() as any)

    if (!googleUser || !googleUser.id) {
        errorUrl.searchParams.set('message', $t('Failed to retrieve user information from Google. Please try again.'))
        response.redirect(errorUrl.toString())
        return
    }

    if (oauthToken.action === 'register') {
        const accountExists = await OauthAccount.findOne({
            where: eb => eb.and([
                eb('provider', '=', 'google'),
                eb('provider_user_id', '=', googleUser.id),
                undeleted(eb)
            ])
        })

        if (accountExists) {
            errorUrl.searchParams.set('message', $t('The Google account you used is already linked to another user. Please log in with that account or use a different Google account.'))
            
            response.redirect(errorUrl.toString())
            return
        }

        const user = await User.create({
            name: googleUser.name || 'Google User',
            username: googleUser.name + '-' + googleUser.id,
            email: googleUser.email,
            password: randomBytes(16).toString('hex'), // Random password since they will log in with Google
            verified_at: new Date(),
        })

        await OauthAccount.create({
            user_id: user.id,
            provider: 'google',
            provider_user_id: googleUser.id,
            provider_user_email: googleUser.email,
        })

        const token = await auth.createTokenForUser(user.id)

        const cookieAuthOptions = config.get('auth.cookie.options', {})
        
        const options = {
            httpOnly: true,
            sameSite: true,
            ...cookieAuthOptions
        }
    
        cookie.set('Authorization', token.token, options)

        response.redirect(successUrl.toString())

        return
    }

    if (oauthToken.action === 'login') {
        const oauthAccount = await OauthAccount.findOne({
            where: eb => eb.and([
                eb('provider', '=', 'google'),
                eb('provider_user_id', '=', googleUser.id),
                undeleted(eb)
            ])
        })

        if (!oauthAccount) {
            errorUrl.searchParams.set('message', $t('No user is linked to the Google account you used. Please register first or use a different Google account.'))
            
            response.redirect(errorUrl.toString())
            return
        }

        const user = await User.find(oauthAccount.user_id)

        if (!user) {
            errorUrl.searchParams.set('message', $t('The user linked to your Google account could not be found. Please contact support.'))
            
            response.redirect(errorUrl.toString())
            return
        }

        const token = await auth.createTokenForUser(user.id)

        const cookieAuthOptions = config.get('auth.cookie.options', {})
        
        const options = {
            httpOnly: true,
            sameSite: true,
            ...cookieAuthOptions
        }
    
        cookie.set('Authorization', token.token, options)

        response.redirect(successUrl.toString())

        return
    }

    if (oauthToken.action === 'connect') {
        const user = await User.findOne({
            where: eb => eb.and([
                eb('id', '=', oauthToken.user_id),
                undeleted(eb)
            ])
        })

        if (!user) {
            errorUrl.searchParams.set('message', $t('Could not find the user associated with this OAuth request.'))
            
            response.redirect(errorUrl.toString())
            return
        }

        const accountExists = await OauthAccount.findOne({
            where: eb => eb.and([
                eb('provider', '=', 'google'),
                eb('provider_user_id', '=', googleUser.id),
                undeleted(eb)
            ])
        })

        if (accountExists) {
            errorUrl.searchParams.set('message', $t('The Google account you used is already linked to another user. Please use a different Google account.'))
            
            response.redirect(errorUrl.toString())
            return
        }

        await OauthAccount.create({
            user_id: user.id,
            provider: 'google',
            provider_user_id: googleUser.id,
            provider_user_email: googleUser.email,
        })

        response.redirect(successUrl.toString())

        return
    }

    errorUrl.searchParams.set('message', $t('Invalid OAuth action.'))
    
    response.redirect(errorUrl.toString())
})