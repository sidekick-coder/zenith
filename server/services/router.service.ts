import fs from 'fs'
import path from 'path'
import { join } from 'path'
import logger from '#server/facades/logger.facade.ts'
import Route from '#server/entities/route.entity.ts'
import type { Handler, Middleware, MiddlewareHandleResult } from '#server/contracts/router.contract.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'


type RouteContext = 'global' | 'group' | 'route'

interface MiddlewareRegister {
    middleware: Middleware
    context: RouteContext
}

interface LoadOptions {
    debug?: boolean;
}


export default class Router<C = {}> {
    private routes: Route[] = []
    private filename = null as string | null
    private files = new Set<string>()

    private middlewares: MiddlewareRegister[] = []
    private prefixes: string[] = []

    private groupPrefixes: string[] = []

    private groups: Router<any>[] = []
    private debug = false
    public logger = logger.child({ label: 'router' })

    public addFile(filename: string) {
        this.files.add(filename)
    }

    public addDir(directory: string) {
        const entries = fs.readdirSync(directory)

        for (const entry of entries) {
            const fullPath = path.join(directory, entry)

            const stats = fs.statSync(fullPath)

            if (stats.isFile() && entry.endsWith('.ts')) {
                this.files.add(fullPath)
                continue
            } 
            
            if (stats.isDirectory()) {
                this.addDir(fullPath)
            }
        }
    }

    public open(filename: string) {
        this.filename = filename
    }

    public close() {
        if (!this.filename) {
            throw new Error('Cannot close router without a filename')
        }

        this.filename = null
    }

    public use<T extends Middleware>(middleware: T, context: RouteContext = 'route') {
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
                if (r.method.toUpperCase() !== method.toUpperCase()) {
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

    public matchPath(routePath: string, requestPath: string): boolean {
        // Split paths into segments
        const routeSegments = routePath.split('/').filter(Boolean)
        const requestSegments = requestPath.split('/').filter(Boolean)

        // Check each segment
        for (let i = 0; i < routeSegments.length; i++) {
            const routeSegment = routeSegments[i]
            const requestSegment = requestSegments[i]

            // If route segment is a wildcard (*), it matches everything from this point
            if (routeSegment === '*') {
                return true
            }

            // If we've run out of request segments but still have route segments, no match
            if (i >= requestSegments.length) {
                return false
            }

            // If route segment is a parameter (starts with :), it matches any value
            if (routeSegment.startsWith(':')) {
                continue
            }

            // Otherwise, segments must match exactly
            if (routeSegment !== requestSegment) {
                return false
            }
        }

        // If we have more request segments than route segments (and no wildcard), no match
        if (requestSegments.length > routeSegments.length) {
            return false
        }

        return true
    }

    private async loadFile(filename: string) {
        if (!fs.existsSync(filename)) {
            this.logger.warn(`File not found: ${filename}`)
            return
        }

        this.open(filename)

        const path = `${filename}?t=${Date.now()}` // Prevent caching issues

        const [error] = await tryCatch(() => import(path))

        if (error) {
            this.logger.error('failed to load routes from file', {
                filename,
                error
            })
        }

        if (this.debug) {
            this.logger.debug('loaded routes file', {
                filename,
            })
        }

        this.close()
    }

    public removeFile(filename: string) {
        this.files.delete(filename)

        if (this.debug) {
            this.logger.debug('removed file', {
                filename,
            })
        }
    }

    public clear() {
        if (this.debug) {
            this.logger.debug('clear', { count: this.routes.length })
        }

        this.routes = []
        this.groups = []
    }

    public list() {
        return this.routes.concat(...this.groups.map(g => g.routes))
    }

    public async load(options: LoadOptions = {}) {
        this.debug = options.debug ?? this.debug

        if (this.debug) {
            this.logger.debug('service loaded in debug mode')
        }

        for (const file of this.files) {
            await this.loadFile(file)
        }
    }
}
