import type { Token } from '@sidekick-coder/zenith-kit/shared'
import auth from '#server/facades/auth.facade.ts'
import type { HttpContext, Middleware, } from '#server/contracts/router.contract.ts'
import type User from '#server/entities/user.entity.ts'
import tokenRepository from '#server/facades/tokenRepository.ts'
import userRepository from '#server/repositories/user.repository.ts'

export type AuthSilenceMiddlewareContext = {
    user?: User
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
        let user: User | undefined = undefined

        if (tokenRow) {
            user = await userRepository.findOrFail(tokenRow.user_id)
        }

        return { 
            user,
            token: tokenRow || undefined,
        }
    }
}

const authSilenceMiddleware = new AuthSilenceMiddleware()

export default authSilenceMiddleware
