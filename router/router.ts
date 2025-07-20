import fs from 'fs'
import path from 'path'
import logger from '../logger.ts'
import Route from './route.ts'
import type { Handler, Middleware } from './types.ts'
import { tryCatch } from '#common/tryCatch.ts'

export default class Router {
    private routes: Route[] = []
    private filename = null as string | null

    public open(filename: string) {
        this.filename = filename
    }

    public close() {
        if (!this.filename) {
            throw new Error('Cannot close router without a filename')
        }

        this.filename = null
    }

    public middleware(middleware: Middleware) {
        const route = new Route()

        route.middleware(middleware)

        this.routes.push(route)

        return route
    }

    public get(path: string, handler: Handler) {
        const route = new Route().get(path, handler)

        this.routes.push(route)

        return route
    }

    public post(path: string, handler: Handler) {
        const route = new Route()
            .method('POST')
            .path(path)
            .handler(handler)

        this.routes.push(route)

        return route
    }

    public resolve(method: string, path: string) {
        const route = this.routes
            .find(r => {
                if (r.seralize().method !== method.toUpperCase()) {
                    return false
                }
            
                return this.matchPath(r.seralize().path, path)
            })

        if (!route) {
            return null
        }

        return route
    }

    public async execute(route: Route, initialCtx: any) {
        const data = route.seralize()

        if (!data.handler) {
            throw new Error(`Route handler not found for ${data.method} ${data.path}`)
        }

        const ctx = { ...initialCtx }

        for await (const middleware of data.middlewares) {
            const result = await middleware.handle(ctx)
            
            Object.assign(ctx, result)
        }

        return data.handler(ctx)
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
            logger.error(`Failed to load routes from ${filename}`, error)
        }

        this.close()

        logger.debug(`loaded routes from ${filename}`)
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
            logger.warn(`Directory not found: ${directory}`)
            return
        }

        const files = fs.readdirSync(directory).filter(file => file.endsWith('.ts'))

        for (const file of files) {
            await this.loadFile(path.join(directory, file))
        }
    }

    public clear(){
        this.routes = []
        logger.debug('cleared all routes')
    }

    public list() {
        return Array.from(this.routes.values())
    }
}