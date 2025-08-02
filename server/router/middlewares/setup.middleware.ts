import type {
    HttpContext,
    Middleware, 
    MiddlewareHandleResult 
} from '#server/router/types.ts'
import config from '#server/services/config.service.ts'

export type SetupMiddlewareContext = MiddlewareHandleResult<[SetupMiddleware]>

export class SetupMiddleware implements Middleware {
    public checked: boolean = false
    public async handle(ctx: HttpContext){
        const allowedPaths = [
            '/admin/setup',
            '/setup',
            '/setup/database',
            '/setup/user',
            '/setup/complete',
        ]

        if (allowedPaths.includes(ctx.url)) {
            return
        }

        const setup = config.get('setup')

        if (setup && setup.database && setup.user) {
            return
        }

        return { redirect: '/setup', }
    }
}

const setupMiddleware = new SetupMiddleware()

export default setupMiddleware
