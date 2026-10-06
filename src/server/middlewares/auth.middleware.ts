import type { Token } from '@sidekick-coder/zenith-kit/shared'
import { UserEntity, BaseException } from '@sidekick-coder/zenith-kit/shared'
import { config } from '@sidekick-coder/zenith-kit/server'
import type { AuthSilenceMiddlewareContext } from './authSilence.middleware'
import type {  Middleware, } from '#server/contracts/router.contract.ts'

export type AuthMiddlewareContext = {
    user: UserEntity
    token: Token
}

export class AuthMiddleware implements Middleware {
    public async handle(ctx: AuthSilenceMiddlewareContext): Promise<AuthMiddlewareContext> {

        const authDisabled = config.get('auth.disabled', false)

        if (authDisabled) {
            return { 
                user: undefined as any,
                token: undefined as any,
            }
        }

        if (!ctx.user || !ctx.token) {
            throw new BaseException('Invalid authentication token', 401)
        }

        return {
            user: ctx.user!,
            token: ctx.token!,
        }
    }
}

const authMiddleware = new AuthMiddleware()

export default authMiddleware
