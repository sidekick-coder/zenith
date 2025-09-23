import BaseException from '#server/exceptions/base.ts'
import auth from '#server/facades/auth.facade.ts'
import type {
    HttpContext, Middleware, 
    MiddlewareHandleResult 
} from '#server/contracts/router.contract.ts'

export type AuthMiddlewareContext = MiddlewareHandleResult<[AuthMiddleware]>

export class AuthMiddleware implements Middleware {
    public async handle(ctx: HttpContext){
        // Example authentication logic
        const token = ctx.cookie.get('Authorization')

        if (!token) {
            throw new BaseException('Authentication token is missing', 401)
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