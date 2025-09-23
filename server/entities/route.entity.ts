import type { Handler,  Middleware } from '../contracts/router.contract.ts'

export default class Route {
    public path: string = ''
    public method: string = 'GET'
    public handler: Handler<any> | null = null
    public filename: string | null = null
    public middlewares: Middleware[] = []

    constructor(data: Partial<Route> = {}) {
        Object.assign(this, data)
    }
}
