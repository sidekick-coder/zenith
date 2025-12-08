import type { AuthSilenceMiddlewareContext } from './authSilence.middleware.ts'
import type {
    Middleware, 
    MiddlewareHandleResult 
} from '#server/contracts/router.contract.ts'

import Acl from '#server/entities/acl.entity.ts'
import Permission from '#server/entities/permission.entity.ts'
import type User from '#server/entities/user.entity.ts'
import config from '#server/facades/config.facade.ts'
import logger from '#server/facades/logger.facade.ts'

export type AuthorizationContext = MiddlewareHandleResult<[AuthorizationMiddleware]>

export interface AuthorizePermissionPayload {
    action: string
    resource: string
    conditions?: Record<string, any>
}

export class AuthorizePermission implements Middleware {
    private permissions: AuthorizePermissionPayload[]

    constructor(payload: AuthorizePermissionPayload | AuthorizePermissionPayload[]) {
        this.permissions = Array.isArray(payload) ? payload : [payload]
    }

    public async handle(ctx: AuthorizationContext) {
        for (const p of this.permissions) {
            ctx.acl.authorize(
                p.action,
                p.resource,
                p.conditions || {},
            )
        }
    }
}

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

        const acl = new Acl({
            permissions,
            debug: config.get('acl.debug') || config.get('app.debug'),
            logger: logger.child({ label: 'acl' }),
        })
        
        return { acl }
    }

    public static create(payload: AuthorizePermissionPayload | AuthorizePermissionPayload[]) {
        return new AuthorizePermission(payload)
    }
}

const authorizationMiddleware = new AuthorizationMiddleware()

export default authorizationMiddleware