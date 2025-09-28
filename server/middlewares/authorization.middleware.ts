import type { AuthSilenceMiddlewareContext } from './authSilence.middleware.ts'
import type {
    Middleware, 
    MiddlewareHandleResult 
} from '#server/contracts/router.contract.ts'

import Acl from '#server/entities/acl.entity.ts'

export type AuthorizationContext = MiddlewareHandleResult<[AuthorizationMiddleware]>

export class AuthorizationMiddleware implements Middleware {
    public async handle(ctx: AuthSilenceMiddlewareContext){

        const permissions = ctx.user?.permissions || []

        const acl = new Acl(permissions)
        
        return { acl }
    }
}

const authorizationMiddleware = new AuthorizationMiddleware()

export default authorizationMiddleware