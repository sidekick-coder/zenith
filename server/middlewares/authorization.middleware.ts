import type { AuthSilenceMiddlewareContext } from './authSilence.middleware.ts'
import type {
    Middleware, 
    MiddlewareHandleResult 
} from '#server/contracts/router.contract.ts'

import Acl from '#server/entities/acl.entity.ts'
import Permission from '#server/entities/permission.entity.ts'
import type User from '#server/entities/user.entity.ts'

export type AuthorizationContext = MiddlewareHandleResult<[AuthorizationMiddleware]>

export class AuthorizationMiddleware implements Middleware {
    public async handle(ctx: AuthSilenceMiddlewareContext){
        let user: any | null = null

        if (ctx.user) {
            user = {
                id: ctx.user.id,
                name: ctx.user.name,
                email: ctx.user.email,
            }
        }

        const permissions = Permission.applyContext(ctx.user?.permissions, {
            auth: { user },
        })

        const acl = new Acl(permissions)
        
        return { acl }
    }
}

const authorizationMiddleware = new AuthorizationMiddleware()

export default authorizationMiddleware