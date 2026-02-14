import BaseException from '#server/exceptions/base.ts'
import type User from '#server/entities/user.entity.ts'
import auth from '#server/facades/auth.facade.ts'
import type {
    HttpContext, Middleware,
} from '#server/contracts/router.contract.ts'

export type AuthMiddlewareContext = {
    user: User
}

export class AuthMiddleware implements Middleware {
    public async handle(ctx: HttpContext): Promise<AuthMiddlewareContext> {
        // Example authentication logic
        let token = ctx.cookie.get('Authorization')

        if (ctx.request && ctx.request.headers['authorization']) {
            token = ctx.request.headers['authorization']
        }

        if (token && token.startsWith('Bearer ')) {
            token = token.slice(7) // Remove 'Bearer ' prefix
        }

        if (!token) {
            const error = new BaseException('Authentication token is missing', 401)

            Object.assign(error, {
                url: ctx.request?.originalUrl,
                method: ctx.request?.method,
            })
            
            throw error
        }

        const user = await auth.authenticate(token)

        if (!user) {
            throw new BaseException('Invalid authentication token', 401)
        }

        return { user }
    }
}

const authMiddleware = new AuthMiddleware()

export default authMiddleware