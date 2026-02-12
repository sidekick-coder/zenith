import type {
    HttpContext,
    Middleware, 
    MiddlewareHandleResult 
} from '#server/contracts/router.contract.ts'
import config from '#server/facades/config.facade.ts'

export type SetupMiddlewareContext = MiddlewareHandleResult<[SetupMiddleware]>

export class SetupMiddleware implements Middleware {
    public checked: boolean = false
    public async handle(ctx: HttpContext){

        const excludeExt = [
            '.js',
            '.css',
            '.png',
            '.jpg',
            '.jpeg',
            '.gif',
            '.json'
        ]

        if (excludeExt.some(ext => ctx.url.endsWith(ext))) {
            return
        }

        if (
            ctx.url.startsWith('/api/setup') 
            || ctx.url.startsWith('/setup')
            || ctx.url.startsWith('/api/health')
        ) {
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
