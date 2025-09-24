import hasher from '#server/facades/hasher.facade.ts'
import db from '#server/facades/db.facade.ts'
import TokenService from '#server/services/token.service.ts'
import User from '#server/entities/user.entity.ts'

export interface LoginCredentials {
    uuid: string
    password: string
}

export interface AuthResult {
    user: {
        id: number
        username: string
        email: string
    } | null
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

    async authenticate(tokenValue: string) {
        const token = await this.tokenService.findToken(tokenValue)
        
        if (!token) {
            return null
        }

        const isValid = await this.tokenService.isTokenValid(tokenValue)

        if (!isValid) {
            return null
        }

        const user = await db.selectFrom('users')
            .selectAll()
            .where('id', '=', token.user_id)
            .where('deleted_at', 'is', null)
            .executeTakeFirst()

        if (!user) {
            return null
        }

        return new User(user)
    }

    async logout(tokenValue: string): Promise<boolean> {
        return this.tokenService.revokeToken(tokenValue)
    }
}
