import auth from '#server/facades/auth.facade.ts'
import type { HttpContext, Middleware, } from '#server/contracts/router.contract.ts'
import type User from '#shared/entities/user.entity.ts'

export type AuthSilenceMiddlewareContext = {
    user: null | User
}

export class AuthSilenceMiddleware implements Middleware {
    public async handle(ctx: HttpContext){
        // Example authentication logic
        const token = ctx.cookie.get('Authorization')

        if (!token) {
            return { user: null }
        }

        const user = await auth.authenticate(token)

        if (!user) {
            return { user: null }
        }

        return { user }
    }
}

const authSilenceMiddleware = new AuthSilenceMiddleware()

export default authSilenceMiddleware