import { randomBytes, randomUUID } from 'crypto'
import { defineHandler, userRepository } from '@sidekick-coder/zenith-kit/server'
import config from '@sidekick-coder/zenith-kit/server/facades/config'
import env from '#server/facades/env.facade.ts'
import OauthToken from '#server/entities/oauthToken.entity.ts'
import OauthAccount from '#server/entities/oauthAccount.entity.ts'
import { undeleted } from '#server/queries/softDelete.ts'
import auth from '#server/facades/auth.facade.ts'

export default defineHandler(async ({ query, response, cookie }) => {
    const code = query.code
    const state = query.state

    let errorUrl = new URL('/errors/oauth', env.get('ZENITH_APP_URL'))

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

    if (oauthToken.metadata.error_url) {
        errorUrl = new URL(oauthToken.metadata.error_url, env.get('ZENITH_APP_URL'))
    }

    const successUrl = new URL(oauthToken.metadata.success_url || '/', env.get('ZENITH_APP_URL'))

    const credentials = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        body: new URLSearchParams({
            code,
            client_id: config.get('oauth.google_client_id', ''),
            client_secret: config.get('oauth.google_client_secret', ''),
            redirect_uri: new URL('/api/oauth/google', env.get('ZENITH_APP_URL')).toString(),
            grant_type: 'authorization_code',
        }),
    }).then((res) => res.json() as any)

    if (!credentials.access_token) {
        response.redirect(errorUrl.toString())
        return
    }

    const googleUser = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: `Bearer ${credentials.access_token}`, }, })
        .then((res) => res.json() as any)

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

        const user = await userRepository.create({
            name: googleUser.name || 'Google User',
            username: googleUser.name + randomUUID(),
            email: googleUser.email,
            password: randomBytes(16).toString('hex'),
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

        cookie.set('Authorization', token.token, {
            httpOnly: true,
            sameSite: true,
            ...cookieAuthOptions
        })

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

        const user = await userRepository.findById(oauthAccount.user_id)

        if (!user) {
            errorUrl.searchParams.set('message', $t('The user linked to your Google account could not be found. Please contact support.'))
            response.redirect(errorUrl.toString())
            return
        }

        const token = await auth.createTokenForUser(user.id)
        const cookieAuthOptions = config.get('auth.cookie.options', {})

        cookie.set('Authorization', token.token, {
            httpOnly: true,
            sameSite: true,
            ...cookieAuthOptions
        })

        response.redirect(successUrl.toString())
        return
    }

    if (oauthToken.action === 'connect') {
        const user = await userRepository.findById(oauthToken.user_id!)

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
