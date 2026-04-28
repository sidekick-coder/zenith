import type { AuthSilenceMiddlewareContext } from './authSilence.middleware.ts'
import type {
    Middleware, 
    MiddlewareHandleResult 
} from '#server/contracts/router.contract.ts'

import Acl from '#server/entities/acl.entity.ts'
import Permission from '#server/entities/permission.entity.ts'
import config from '#server/facades/config.facade.ts'
import logger from '#server/facades/logger.facade.ts'
import type User from '#shared/entities/user.entity.ts'
import permissionRepository from '#server/facades/permissionRepository.ts'
import permissionAssignmentRepository from '#server/facades/permissionAssignmentRepository.ts'

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
        const token = ctx.token
        let currentPermissions: Permission[] = []
        const permissionContext = {} as Record<string, any>

        // if auth token load permissions for user
        if (ctx.user && token?.type === 'auth') {
            const assignments = await permissionAssignmentRepository.findMany({
                assignableId: String(ctx.user.id),
                assignableType: 'user'
            })

            currentPermissions = await permissionRepository.findMany({ id: assignments.map(a => a.permission_id) })

            permissionContext.auth = {
                user: {
                    id: ctx.user.id,
                    name: ctx.user.name,
                    email: ctx.user.email,
                },
            }
        }

        if (token && token.type === 'api') {
            const assignments = await permissionAssignmentRepository.findMany({
                assignableId: String(token.id),
                assignableType: 'token'
            })

            currentPermissions = await permissionRepository.findMany({ id: assignments.map(a => a.permission_id) })

            permissionContext.api = {
                token: {
                    id: token.id,
                    name: token.name,
                },
            }
        }

        const permissions = Permission.applyContext(currentPermissions, permissionContext)

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
