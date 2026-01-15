import hasher from '#server/facades/hasher.facade.ts'
import db from '#server/facades/db.facade.ts'
import TokenService from '#server/services/token.service.ts'
import User from '#server/entities/user.entity.ts'
import EmailTemplate from '#server/entities/emailTemplate.entity.ts'
import mailer from '#server/facades/mailer.facade.ts'
import encrypt from '#server/facades/encrypt.facade.ts'
import env from '#server/facades/env.facade.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

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
    public static readonly DI_KEY = 'auth'
    private tokenService = new TokenService()

    async login(credentials: LoginCredentials): Promise<AuthResult> {
        const { uuid, password } = credentials

        const user = await db.selectFrom('users')
            .selectAll()
            .where((eb) => eb.or([
                eb('email', '=', uuid),
                eb('username', '=', uuid),
            ]))
            .where('deleted_at', 'is', null)
            .executeTakeFirst()

        if (!user) {
            return {
                user: null,
                success: false,
                message: 'Invalid credentials'
            }
        }

        const passwordMatches = await hasher.compare(password, user.password)

        if (!passwordMatches) {
            return {
                user: null,
                success: false,
                message: 'Invalid credentials'
            }
        }

        // Create auth token on successful login
        const token = await this.tokenService.createToken({
            user_id: user.id,
            type: 'auth',
            expires_in_hours: 24 // Token expires in 24 hours
        })

        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            },
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
            .where('deleted_at', 'is', null)
            .executeTakeFirst()

        if (existingUser) {
            return {
                user: null,
                success: false,
                message: 'User already exists with this email or username'
            }
        }

        // Create new user
        const newUser = await User.create({
            name: username,
            username,
            email,
            password: await this.hashPassword(password)
        })

        // Create auth token for the new user
        const token = await this.tokenService.createToken({
            user_id: newUser.id!,
            type: 'auth',
            expires_in_hours: 24
        })

        return {
            user: {
                id: newUser.id!,
                username: newUser.username,
                email: newUser.email
            },
            token: token.token,
            success: true,
            message: 'Registration successful'
        }
    }

    async logout(tokenValue: string): Promise<boolean> {
        return this.tokenService.revokeToken(tokenValue)
    }

    async forgetPassword(email: string) {
        const user = await User.findByUUID(email)

        if (!user) {
            return false
        }

        const template = await EmailTemplate.findByOrFail('key', 'password_reset')

        const token = encrypt.encryptObject({
            expire_at: Date.now() + 3600 * 1000, // 1 hour expiration
            user_id: user.id,
        })

        const url = new URL('/auth/reset-password', env.get('APP_URL'))

        url.searchParams.append('token', token)

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
        const [error, payload] = await tryCatch(() => 
            encrypt.decryptObject<{ expire_at: number, user_id: number }>(token)
        )

        if (error) {
            return false
        }

        if (Date.now() > payload.expire_at) {
            return false
        }

        const user = await User.findOrFail(payload.user_id)

        await User.updateById(user.id, { password: newPassword })  

        return true
    }
}
