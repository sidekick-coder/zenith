import hasher from '#facades/hasher.ts'
import db from '#facades/db.ts'

export interface LoginCredentials {
    email: string
    password: string
}

export interface AuthResult {
    user: {
        id: number
        username: string
        email: string
    } | null
    success: boolean
    message: string
}

export default class AuthService {
    public static readonly DI_KEY = 'auth'

    async login(credentials: LoginCredentials): Promise<AuthResult> {
        const { email, password } = credentials

        if (!email || !password) {
            return {
                user: null,
                success: false,
                message: 'Email and password are required'
            }
        }

        const user = await db.selectFrom('users')
            .selectAll()
            .where('email', '=', email)
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

        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            },
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
}
