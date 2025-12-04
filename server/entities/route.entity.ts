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

    public static params(routePath: string, requestPath: string): Record<string, string> {
        const params: Record<string, string> = {}

        const routeSegments = routePath.split('/').filter(Boolean)
        const requestSegments = requestPath.split('/').filter(Boolean)

        for (let i = 0; i < routeSegments.length; i++) {
            const routeSegment = routeSegments[i]
            const requestSegment = requestSegments[i]

            if (routeSegment.startsWith(':')) {
                const paramName = routeSegment.slice(1) // Remove the ':' prefix
                params[paramName] = requestSegment
            }
            
            if (routeSegment === '*') {
                // Capture all remaining segments as a single path
                const remainingSegments = requestSegments.slice(i)
                params['*'] = remainingSegments.join('/')
                break
            }
        }

        return params
    }

    public static query(requestPath: string): Record<string, string> {
        const query: Record<string, string> = {}
        const queryString = requestPath.split('?')[1]

        if (!queryString) {
            return query
        }

        const pairs = queryString.split('&')

        for (const pair of pairs) {
            const [key, value] = pair.split('=')

            if (key) {
                query[decodeURIComponent(key)] = value ? decodeURIComponent(value) : ''
            }
        }

        return query
    }
}
