import { AbilityBuilder, Ability } from '@casl/ability'
import type {
    HttpContext, Middleware, 
    MiddlewareHandleResult 
} from '#server/contracts/router.contract.ts'

export type AuthorizationContext = MiddlewareHandleResult<[AuthorizationMiddleware]>

export class AuthorizationMiddleware implements Middleware {
    public async handle(ctx: HttpContext){
        const { can, cannot, build } = new AbilityBuilder(Ability)

        if (ctx.user) {
            console.log('Defining abilities for user:', ctx.user)
        }

        const ability = build()

        return { ability }
    }
}

const authorizationMiddleware = new AuthorizationMiddleware()

export default authorizationMiddleware