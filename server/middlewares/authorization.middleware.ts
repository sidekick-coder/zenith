import { defineAbility } from '@casl/ability'
import type { AuthSilenceMiddlewareContext } from './authSilence.middleware.ts'
import type {
    Middleware, 
    MiddlewareHandleResult 
} from '#server/contracts/router.contract.ts'
import BaseException from '#server/exceptions/base.ts'
import Role from '#shared/entities/role.entity.ts'
import { list } from '#server/queries/list.ts'
import db from '#server/facades/db.facade.ts'
import User from '#shared/entities/user.entity.ts'

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
    public async getRoles(user?: User | null): Promise<Role[]> {
        if (!user) {
            return [] as Role[]
        }

        const query = await db.selectFrom('roles')
            .selectAll()
            .where('id', 'in', (eb) =>
                eb.selectFrom('user_roles')
                    .select('role_id')
                    .where('user_id', '=', user.id)
            )

        const rows = await query.execute()

        return rows.map(r => new Role(r))
    }

    public async handle(ctx: AuthSilenceMiddlewareContext){

        const roles = await this.getRoles(ctx.user)

        const ability = defineAbility((can) => {
            if (roles.find(r => r.name === 'admin')) {
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