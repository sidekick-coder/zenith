import type {
    Middleware, 
    MiddlewareHandleResult 
} from '#router/types.ts'
import config from '#services/config.service.ts'

export type SetupMiddlewareContext = MiddlewareHandleResult<[SetupMiddleware]>

export class SetupMiddleware implements Middleware {
    public checked: boolean = false
    public async handle(){
        // if (this.checked) return

        // const database = config.get('database')

        // console.log(database)

        return { redirect: '/setup', }
    }
}

const setupMiddleware = new SetupMiddleware()

export default setupMiddleware
