import type { Handler,  Middleware } from '../contracts/router.contract.ts'

type RouteMethod = 'get' 
    | 'GET' 
    | 'post' 
    | 'POST' 
    | 'put' 
    | 'PUT' 
    | 'patch' 
    | 'PATCH' 
    | 'delete' 
    | 'DELETE'

export default class Route {
    public path: string = ''
    public method: RouteMethod = 'get'
    public handler: Handler<any> | null = null
    public filename: string | null = null
    public middlewares: Middleware[] = []

    constructor(data: Partial<Route> = {}) {
        Object.assign(this, data)
    }
}
