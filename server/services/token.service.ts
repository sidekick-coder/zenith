import { randomBytes } from 'crypto'
import db from '#server/facades/db.facade.ts'
import { create } from '#server/queries/index.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

export interface Token {
    id: number
    user_id: number
    token: string
    type: string
    expires_at: Date | null
    created_at: Date
    updated_at: Date
}

export interface CreateTokenData {
    user_id: number
    type?: string
    expires_in_hours?: number
}

export default class TokenService {
    /**
     * Generate a secure random token using crypto
     */
    private generateToken(): string {
        return randomBytes(32).toString('hex')
    }

    /**
     * Create a new token for a user
     */
    async createToken(data: CreateTokenData): Promise<Token> {
        const token = this.generateToken()
        const expiresAt = data.expires_in_hours 
            ? new Date(Date.now() + data.expires_in_hours * 60 * 60 * 1000)
            : null

        const result = await create('tokens', {
            values: {
                user_id: data.user_id,
                token,
                type: data.type || 'auth',
                expires_at: expiresAt as any
            }
        })

        return {
            ...result,
            expires_at: result.expires_at ? new Date(result.expires_at) : null,
            created_at: new Date(result.created_at),
            updated_at: new Date(result.updated_at)
        }
    }

    /**
     * Find a token by its value
     */
    async findToken(tokenValue: string): Promise<Token | null> {
        const [error, result] = await tryCatch(() => db.selectFrom('tokens')
            .selectAll()
            .where('token', '=', tokenValue)
            .executeTakeFirst()
        )

        if (error || !result) {
            return null
        }

        return {
            ...result,
            expires_at: result.expires_at ? new Date(result.expires_at) : null,
            created_at: new Date(result.created_at),
            updated_at: new Date(result.updated_at)
        }
    }

    /**
     * Validate if a token is still valid (not expired)
     */
    async isTokenValid(tokenValue: string): Promise<boolean> {
        const token = await this.findToken(tokenValue)

        if (!token) {
            return false
        }

        if (token.expires_at && token.expires_at < new Date()) {
            return false
        }

        return true
    }

    /**
     * Revoke a token by deleting it
     */
    async revokeToken(tokenValue: string): Promise<boolean> {
        const result = await db.deleteFrom('tokens')
            .where('token', '=', tokenValue)
            .execute()

        return result.length > 0
    }

    /**
     * Revoke all tokens for a user
     */
    async revokeUserTokens(userId: number): Promise<number> {
        const result = await db.deleteFrom('tokens')
            .where('user_id', '=', userId)
            .execute()

        return result.length
    }

    /**
     * Clean up expired tokens
     */
    async cleanupExpiredTokens(): Promise<number> {
        const now = new Date().toISOString()
        const result = await db.deleteFrom('tokens')
            .where('expires_at', '<', now)
            .execute()

        return result.length
    }
}
