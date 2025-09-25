import { defineAbility, subject as createSubject } from '@casl/ability'
import type { AuthSilenceMiddlewareContext } from './authSilence.middleware.ts'
import type {
    Middleware, 
    MiddlewareHandleResult 
} from '#server/contracts/router.contract.ts'
import BaseException from '#server/exceptions/base.ts'
import rootLogger from '#server/facades/logger.facade.ts'

export type AuthorizationContext = MiddlewareHandleResult<[AuthorizationMiddleware]>

const logger = rootLogger.child({ label: 'acl' })

export class Acl {
    public ability: ReturnType<typeof defineAbility>

    constructor(ability: ReturnType<typeof defineAbility>) {
        this.ability = ability
    }

    public can(action: string, subject: any) {
        return this.ability.can(action, subject)
    }

    public cannot(action: string, subject: any) {
        return this.ability.cannot(action, subject)
    }

    public subject(subject: string, object: Record<string, any>) {
        return createSubject(subject, object)
    }

    public authorize(action: string, subject: any) {
        if (this.cannot(action, subject)) {
            throw new BaseException('Unauthorized', 403)
        }
    }
}

export class AuthorizationMiddleware implements Middleware {
    public async handle(ctx: AuthSilenceMiddlewareContext){

        if (ctx.user) {
            await ctx.user.loadPermissions()
        }

        const permissions = ctx.user?.permissions || []

        const ability = defineAbility((can) => {
            permissions.forEach((permission) => {
                can(permission.action, permission.subject, permission.conditions)
            })

            logger.debug('user permissions', { permissions })
        })

        const acl = new Acl(ability)
        
        return { acl }
    }
}

const authorizationMiddleware = new AuthorizationMiddleware()

export default authorizationMiddleware