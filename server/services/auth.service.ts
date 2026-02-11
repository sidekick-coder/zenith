import hasher from '#server/facades/hasher.facade.ts'
import db from '#server/facades/db.facade.ts'
import TokenService from '#server/services/token.service.ts'
import User from '#server/entities/user.entity.ts'
import EmailTemplate from '#server/entities/emailTemplate.entity.ts'
import mailer from '#server/facades/mailer.facade.ts'
import env from '#server/facades/env.facade.ts'
import { undeleted } from '#server/queries/softDelete.ts'
import config from '#server/facades/config.facade.ts'

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
    user: User | null
    token?: string
    success: boolean
    message: string
}

export default class AuthService {
    private tokenService = new TokenService()

    async createTokenForUser(userId: number, type: string = 'auth', expiresInHours?: number) {
        // Create auth token on successful login
        const entity = await this.tokenService.createToken({
            user_id: userId,
            type: type,
            expires_in_hours: expiresInHours || 24 // Token expires in 24 hours by default
        })

        return entity
    }

    async login(credentials: LoginCredentials): Promise<AuthResult> {
        const { uuid, password } = credentials

        const user = await db.selectFrom('users')
            .selectAll()
            .where((eb) => eb.or([
                eb('email', '=', uuid),
                eb('username', '=', uuid),
            ]))
            .where(undeleted)
            .executeTakeFirst()

        if (!user) {
            return {
                user: null,
                success: false,
                message: $t('Invalid credentials')
            }
        }

        const passwordMatches = await hasher.compare(password, user.password)

        if (!passwordMatches) {
            return {
                user: null,
                success: false,
                message: $t('Invalid credentials')
            }
        }

        if (!user.verified_at) {
            return {
                user: null,
                success: false,
                message: $t('Please verify your email before logging in')
            }
        }

        // Create auth token on successful login
        const token = await this.tokenService.createToken({
            user_id: user.id,
            type: 'auth',
            expires_in_hours: 24 // Token expires in 24 hours
        })

        return {
            user: User.from({
                id: user.id,
                username: user.username,
                email: user.email,
                verified_at: user.verified_at
            }),
            token: token.token,
            success: true,
            message: 'Login successful'
        }
    }

    async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return hasher.compare(plainPassword, hashedPassword)
    }

    async hashPassword(password: string): Promise<string> {
        return hasher.hash(password)
    }

    async authenticate(tokenValue?: string | null) {
        if (!tokenValue) {
            return null
        }
        
        const token = await this.tokenService.findToken(tokenValue)
        
        if (!token) {
            return null
        }

        const isValid = await this.tokenService.isTokenValid(tokenValue)

        if (!isValid) {
            return null
        }

        const row = await db.selectFrom('users')
            .selectAll()
            .where('id', '=', token.user_id)
            .where('deleted_at', 'is', null)
            .executeTakeFirst()

        if (!row) {
            return null
        }

        const user = User.from(row)

        await user.loadPermissions()

        return user
    }

    async register(credentials: RegisterCredentials): Promise<AuthResult> {
        const { username, email, password } = credentials

        // Check if user already exists
        const existingUser = await db.selectFrom('users')
            .selectAll()
            .where((eb) => eb.or([
                eb('email', '=', email),
                eb('username', '=', username),
            ]))
            .where(undeleted)
            .executeTakeFirst()

        if (existingUser) {
            return {
                user: null,
                success: false,
                message: 'User already exists with this email or username'
            }
        }

        const needVerifyEmail = config.get('auth.enable_email_verification', false)

        // Create new user
        const newUser = await User.create({
            name: username,
            username,
            email,
            password: password,
            verified_at: needVerifyEmail ? null : new Date()
        })

        if (needVerifyEmail) {
            await this.sendVerifyEmail(newUser.email)   
        }

        return {
            user: User.from({
                id: newUser.id!,
                username: newUser.username,
                email: newUser.email,
                verified_at: newUser.verified_at
            }),
            success: true,
            message: 'Registration successful'
        }
    }

    async logout(tokenValue: string): Promise<boolean> {
        return this.tokenService.revokeToken(tokenValue)
    }

    async sendVerifyEmail(email: string) {
        const user = await User.findByEmail(email)

        if (!user) {
            return false
        }

        if (user.verified_at) {
            return false
        }

        const template = await EmailTemplate.findByOrFail('key', 'verify_email')

        const tokenData = await this.tokenService.createToken({
            user_id: user.id,
            type: 'email_verification',
            expires_in_hours: 24
        })

        const url = new URL('/api/auth/verify-email', env.get('APP_URL'))

        url.searchParams.append('token', tokenData.token)

        const compiled = template.render({ 
            user,
            verify_url: url.toString()
        })

        await mailer.send({
            to: user.email,
            subject: compiled.subject,
            body: compiled.html,
        })

        return true
    }

    async verifyEmail(token: string): Promise<boolean> {
        const tokenData = await this.tokenService.findToken(token)

        if (!tokenData || tokenData.type !== 'email_verification') {
            return false
        }

        const isValid = await this.tokenService.isTokenValid(token)

        if (!isValid) {
            return false
        }

        const user = await User.findOrFail(tokenData.user_id)

        if (user.verified_at) {
            return false
        }

        await User.updateById(user.id, { verified_at: new Date() })

        await this.tokenService.revokeToken(token)

        return true
    }

    async forgetPassword(email: string) {
        const user = await User.findByEmail(email)

        if (!user) {
            return false
        }

        const template = await EmailTemplate.findByOrFail('key', 'password_reset')

        const tokenData = await this.tokenService.createToken({
            user_id: user.id,
            type: 'password_reset',
            expires_in_hours: 1 / 6 // 10 minutes (1/6 of an hour)
        })

        const url = new URL('/auth/reset-password', env.get('APP_URL'))

        url.searchParams.append('token', tokenData.token)

        const compiled = template.render({ 
            user,
            reset_url: url.toString()
        })

        await mailer.send({
            to: user.email,
            subject: compiled.subject,
            body: compiled.html,
        })
    }

    async resetPassword(token: string, newPassword: string): Promise<boolean> {
        const tokenData = await this.tokenService.findToken(token)

        if (!tokenData || tokenData.type !== 'password_reset') {
            return false
        }

        const isValid = await this.tokenService.isTokenValid(token)

        if (!isValid) {
            return false
        }

        const user = await User.findOrFail(tokenData.user_id)

        await User.updateById(user.id, { password: newPassword })

        // Revoke the password reset token after successful use
        await this.tokenService.revokeToken(token)

        return true
    }
}
