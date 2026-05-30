import type { Token } from '@sidekick-coder/zenith-kit/shared'
import { UserEntity } from '@sidekick-coder/zenith-kit/shared'
import type { AuthSilenceMiddlewareContext } from './authSilence.middleware'
import BaseException from '#server/exceptions/base.ts'
import type {  Middleware, } from '#server/contracts/router.contract.ts'

export type AuthMiddlewareContext = {
    user: UserEntity
    token: Token
}

export class AuthMiddleware implements Middleware {
    public async handle(ctx: AuthSilenceMiddlewareContext): Promise<AuthMiddlewareContext> {
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
