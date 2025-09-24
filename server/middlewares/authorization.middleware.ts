import { defineAbility } from '@casl/ability'
import type { AuthSilenceMiddlewareContext } from './authSilence.middleware.ts'
import type {
    Middleware, 
    MiddlewareHandleResult 
} from '#server/contracts/router.contract.ts'
import BaseException from '#server/exceptions/base.ts'

export type AuthorizationContext = MiddlewareHandleResult<[AuthorizationMiddleware]>

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

    public authorize(action: string, subject: any) {
        if (this.cannot(action, subject)) {
            throw new BaseException('Unauthorized', 403)
        }
    }
}

export class AuthorizationMiddleware implements Middleware {
    public async handle(ctx: AuthSilenceMiddlewareContext){

        if (ctx.user) {
            await ctx.user.loadRoles()
        }

        const ability = defineAbility((can) => {
            if (ctx.user?.roles?.find(r => r.name === 'admin')) {
                can('manage', 'all')
                return
            }
        })

        const acl = new Acl(ability)
        
        return { acl }
    }
}

const authorizationMiddleware = new AuthorizationMiddleware()

export default authorizationMiddleware