import fs from 'fs'
import modules from '#services/modules.service.ts'
import { basePath } from '#utils/paths.ts'
import { tryCatch } from '#utils/tryCatch.ts'
import logger from '../logger.ts'
import Route from './route.ts'
import type { Handler } from './types.ts'

export default class Router {
    private routes = new Map<string, Route>()
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

    public add(payload: Pick<Route, 'method' | 'path' | 'handler'>) {
        const key = `${payload.method.toUpperCase()} ${payload.path}`

        if (!this.filename) {
            throw new Error('Cannot add route without a filename. Did you forget to call open()?')
        }

        const route = new Route(payload.method, payload.path, this.filename, payload.handler)

        this.routes.set(key, route)

        return route
    }

    public remove(path: string, httpMethod?: string) {
        const method = httpMethod ? httpMethod.toUpperCase() : 'GET'
        const key = `${method} ${path}`

        this.routes.delete(key)
    }

    public get(path: string, handler: Handler) {
        return this.add({
            method: 'GET',
            path,
            handler 
        })
    }

    public post(path: string, handler: Handler) {
        return this.add({
            method: 'POST',
            path,
            handler 
        })
    }

    public put(path: string, handler: Handler) {
        return this.add({
            method: 'PUT',
            path,
            handler 
        })
    }

    public delete(path: string, handler: Handler) {
        return this.add({
            method: 'DELETE',
            path,
            handler 
        })
    }

    public resolve(method: string, path: string) {
        const routes = Array.from(this.routes.values())

        const route = routes.find(r => {
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

    private matchPath(routePath: string, requestPath: string): boolean {
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
            this.routes.delete(`${route.method} ${route.path}`)
        }

        logger.debug(`removed routes from ${filename}`)
    }

    public async load() {
        // clear 
        this.routes.clear()

        // load root routes 
        for await (const filename of fs.readdirSync(basePath('router', 'routes'))) {
            await this.loadFile(basePath('router', 'routes', filename))
        }

        // load module routes
        const mods = await modules.list({ enabled: true })

        for await (const mod of mods) {
            const filename = mod.makePath('server', 'routes.ts')

            if (!fs.existsSync(filename)) {
                continue
            }

            await this.loadFile(filename)
        }
    }

    public list() {
        return Array.from(this.routes.values())
    }
}