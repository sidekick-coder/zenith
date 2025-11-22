import auth from '#server/facades/auth.facade.ts'
import type { HttpContext, Middleware, } from '#server/contracts/router.contract.ts'
import type User from '#server/entities/user.entity.ts'

export type AuthSilenceMiddlewareContext = {
    user?: User
}

export class AuthSilenceMiddleware implements Middleware {
    public async handle(ctx: HttpContext): Promise<AuthSilenceMiddlewareContext> {
        // Example authentication logic
        const token = ctx.cookie.get('Authorization') || ctx.request.headers['authorization'] as string

        if (!token) {
            return { user: undefined }
        }

        const user = await auth.authenticate(token)

        if (!user) {
            return { user: undefined }
        }

        return { user }
    }
}

const authSilenceMiddleware = new AuthSilenceMiddleware()

export default authSilenceMiddleware