import { UserEntity } from '@sidekick-coder/zenith-kit/shared'
import { env, container, userRepository } from '@sidekick-coder/zenith-kit/server'
import config from '@sidekick-coder/zenith-kit/server/facades/config'
import { AuthService as BaseAuthService } from '@sidekick-coder/zenith-kit/server'
import hasher from '#server/facades/hasher.facade.ts'
import db from '#server/facades/db.facade.ts'
import TokenService from '#server/services/token.service.ts'
import EmailTemplate from '#server/entities/emailTemplate.entity.ts'
import MailerService from '#server/services/mailer.service.ts'
import mailer from '#server/facades/mailer.facade.ts'
import { undeleted } from '#server/queries/softDelete.ts'

export interface LoginCredentials {
    uuid: string
    password: string
}

export interface RegisterCredentials {
    username: string
    email: string
    password: string
}

export interface AuthResult {
    user: UserEntity | null
    token?: string
    success: boolean
    message: string
}

export default class AuthService extends BaseAuthService {
    async sendVerifyEmail(email: string) {
        const user = await userRepository.findOne({ email })

        if (!user) {
            return false
        }

        if (user.verified_at) {
            return false
        }

        const template = await EmailTemplate.findByOrFail('key', 'verify_email')

        const tokenData = await this.tokenRepository.generate({
            user_id: user.id,
            type: 'email_verification',
            expires_in_hours: 24
        })

        const url = new URL('/api/auth/verify-email', env.get('ZENITH_APP_URL'))

        url.searchParams.append('token', tokenData.token)

        const compiled = template.render({ 
            user,
            verify_url: url.toString()
        })

        const mailerOriginal = container.get<MailerService>(MailerService)

        await mailerOriginal.send({
            to: user.email,
            subject: compiled.subject,
            body: compiled.html,
        })

        return true
    }

    async verifyEmail(token: string): Promise<boolean> {
        const tokenData = await this.tokenRepository.findActiveToken(token)

        if (!tokenData || tokenData.type !== 'email_verification') {
            return false
        }

        const user = await userRepository.findByIdOrFail(tokenData.user_id)

        if (user.verified_at) {
            return false
        }

        await userRepository.updateById(user.id, { verified_at: new Date() })

        await this.tokenRepository.revoke(token)

        return true
    }

    async forgetPassword(email: string) {
        const user = await userRepository.findOne({ email })

        if (!user) {
            return false
        }

        const template = await EmailTemplate.findByOrFail('key', 'password_reset')

        const tokenData = await this.tokenRepository.generate({
            user_id: user.id,
            type: 'password_reset',
            expires_in_hours: 1 / 6 // 10 minutes (1/6 of an hour)
        })

        const url = new URL('/auth/reset-password', env.get('ZENITH_APP_URL'))

        url.searchParams.append('token', tokenData.token)

        const compiled = template.render({ 
            user,
            reset_url: url.toString()
        })

        const mailerOriginal = container.get<MailerService>(MailerService)

        await mailerOriginal.send({
            to: user.email,
            subject: compiled.subject,
            body: compiled.html,
        })
    }

    async resetPassword(token: string, newPassword: string): Promise<boolean> {
        const tokenData = await this.tokenRepository.findActiveToken(token)

        if (!tokenData || tokenData.type !== 'password_reset') {
            return false
        }

        const user = await userRepository.findByIdOrFail(tokenData.user_id)

        await userRepository.updateById(user.id, { password: newPassword })

        // Revoke the password reset token after successful use
        await this.tokenRepository.revoke(token)

        return true
    }
}
