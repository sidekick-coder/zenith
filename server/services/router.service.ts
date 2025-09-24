import fs from 'fs'
import path from 'path'
import { join } from 'path'
import rootLogger from '../facades/logger.facade.ts'
import Route from '../entities/route.entity.ts'
import type {
    Handler, Middleware, MiddlewareHandleResult 
} from '../contracts/router.contract.ts'
import { tryCatch } from '#shared/tryCatch.ts'

const logger = rootLogger.child({ label: 'router' })


type RouteContext = 'global' | 'group' | 'route'

interface MiddlewareRegister {
    middleware: Middleware
    context: RouteContext
}


export default class Router<C = {}> {
    private routes: Route[] = []
    private filename = null as string | null

    private middlewares: MiddlewareRegister[] = []
    private prefixes: string[] = []

    private groupPrefixes: string[] = []

    private groups: Router<any>[] = []

    public open(filename: string) {
        this.filename = filename
    }

    public close() {
        if (!this.filename) {
            throw new Error('Cannot close router without a filename')
        }

        this.filename = null
    }

    public use(middleware: Middleware, context: RouteContext = 'route') {
        this.middlewares.push({
            middleware,
            context,
        })

        return this as Router<C & MiddlewareHandleResult<[typeof middleware]>>
    }

    public prefix(prefix: string) {
        this.prefixes.push(prefix)

        return this
    }

    public makePath(args: string): string {
        return join(...this.groupPrefixes, ...this.prefixes, args)
    }

    public add(payload: Pick<Route, 'path' | 'method' | 'handler'>) {
        const route = new Route({
            method: payload.method,
            path: this.makePath(payload.path),
            handler: payload.handler,
            middlewares: this.middlewares.map(m => m.middleware),
        })

        this.middlewares = this.middlewares.filter(m => m.context !== 'route')

        this.prefixes = [] // Reset prefixes after use

        this.routes.push(route)
    }

    public get(path: string, handler: Handler<C>) {
        this.add({
            path,
            method: 'GET',
            handler,
        })
    }

    public post(path: string, handler: Handler<C>) {
        this.add({
            path,
            method: 'POST',
            handler,
        })
    }

    public put(path: string, handler: Handler<C>) {
        this.add({
            path,
            method: 'PUT',
            handler,
        })
    }

    public patch(path: string, handler: Handler<C>) {
        this.add({
            path,
            method: 'PATCH',
            handler,
        })
    }

    public delete(path: string, handler: Handler<C>) {
        this.add({
            path,
            method: 'DELETE',
            handler,
        })
    }
    

    public group() {
        const group = new Router<C>()

        group.filename = this.filename
        group.groupPrefixes = this.prefixes // Inherit prefixes from parent
        group.middlewares = this.middlewares.map(r => ({
            middleware: r.middleware,
            context: 'group' 
        }))

        this.groups.push(group)

        this.middlewares = this.middlewares.filter(m => m.context !== 'route')
        this.prefixes = [] // Reset prefixes after use

        return group
    }

    public resolve(method: string, path: string) {
        const route = this.list()
            .find(r => {
                if (r.method !== method.toUpperCase()) {
                    return false
                }

                return this.matchPath(r.path, path)
            })

        if (!route) {
            return null
        }

        return route
    }

    public async execute(route: Route, initialCtx: any) {
        if (!route.handler) {
            throw new Error(`Route handler not found for ${route.method} ${route.path}`)
        }

        const ctx = { ...initialCtx }

        for await (const middleware of route.middlewares) {
            const result = await middleware.handle(ctx)

            if (result && 'redirect' in result) {
                return result
            }

            Object.assign(ctx, result)
        }

        return route.handler(ctx)
    }

    public extractParams(routePath: string, requestPath: string): Record<string, string> {
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
        }

        return params
    }

    public extractQuery(requestPath: string): Record<string, string> {
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

    public matchPath(routePath: string, requestPath: string): boolean {
        // Split paths into segments
        const routeSegments = routePath.split('/').filter(Boolean)
        const requestSegments = requestPath.split('/').filter(Boolean)

        // Different number of segments means no match
        if (routeSegments.length !== requestSegments.length) {
            return false
        }

        // Check each segment
        for (let i = 0; i < routeSegments.length; i++) {
            const routeSegment = routeSegments[i]
            const requestSegment = requestSegments[i]

            // If route segment is a parameter (starts with :), it matches any value
            if (routeSegment.startsWith(':')) {
                continue
            }

            // Otherwise, segments must match exactly
            if (routeSegment !== requestSegment) {
                return false
            }
        }

        return true
    }

    public async loadFile(filename: string) {
        if (!fs.existsSync(filename)) {
            logger.warn(`File not found: ${filename}`)
            return
        }

        this.open(filename)

        const path = `${filename}?t=${Date.now()}` // Prevent caching issues

        const [error] = await tryCatch(() => import(path))

        if (error) {
            logger.error(`failed to load routes from ${filename}`, error)
        }

        this.close()
    }

    public async removeFile(filename: string) {
        const routes = Array.from(this.routes.values())

        const toRemove = routes.filter(route => route.filename === filename)

        for (const route of toRemove) {
            this.routes = this.routes.filter(r => r !== route)
        }

        logger.debug(`removed routes from ${filename}`)
    }

    public async loadDirectory(directory: string) {
        if (!fs.existsSync(directory)) {
            logger.warn('directory not found', { directory })
            return
        }

        const files = fs.readdirSync(directory).filter(file => file.endsWith('.ts'))

        for (const file of files) {
            await this.loadFile(path.join(directory, file))
        }

        logger.debug('loaded directory', { files })
    }

    public clear() {
        logger.debug('clear', { count: this.routes.length })
        this.routes = []
    }

    public list() {
        return this.routes.concat(...this.groups.map(g => g.routes))
    }
}
