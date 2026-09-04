import {  UserEntity } from '@sidekick-coder/zenith-kit/shared'
import type { Token } from '@sidekick-coder/zenith-kit/shared'
import { userRepository, tokenRepository } from '@sidekick-coder/zenith-kit/server'
import type { HttpContext, Middleware, } from '#server/contracts/router.contract.ts'

export type AuthSilenceMiddlewareContext = {
    user?: UserEntity
    token?: Token
}

export class AuthSilenceMiddleware implements Middleware {
    public async handle(ctx: HttpContext): Promise<AuthSilenceMiddlewareContext> {
        // Example authentication logic
        let token = ctx.cookie.get('Authorization')

        if (ctx.request && ctx.request.headers['authorization']) {
            token = ctx.request.headers['authorization']
        }

        if (token && token.startsWith('Bearer ')) {
            token = token.slice(7) // Remove 'Bearer ' prefix
        }

        if (!token) {
            return { 
                user: undefined,
                token: undefined,
            }
        }

        const tokenRow = await tokenRepository.findByToken(token)
        let user: UserEntity | undefined = undefined

        if (tokenRow) {
            const data = await userRepository.findByIdOrFail(tokenRow.user_id)

            user = UserEntity.from(data as any)
        }

        return { 
            user,
            token: tokenRow || undefined,
        }
    }
}

const authSilenceMiddleware = new AuthSilenceMiddleware()

export default authSilenceMiddleware
