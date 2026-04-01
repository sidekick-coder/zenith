import fg from 'fast-glob'
import type Router from './router.service.ts'
import LoggerService from '#shared/services/logger.service.ts'
import BaseException from '#server/exceptions/base.ts'

interface RouteFileDefinition {
    file: string
    routePath: string
    method: 'get' | 'post' | 'patch' | 'delete' | 'put'
    sortKey: number
}

export default class RouterFileBaseRoutingService {
    private directory: string 
    private prefix: string
    private debug = false
    private router: Router
    private logger = new LoggerService()
    private routes: RouteFileDefinition[] = []

    public setDirectory(directory: string) {
        this.directory = directory
        return this
    }

    public setPrefix(prefix: string) {
        this.prefix = prefix
        return this
    }

    public setDebug(debug: boolean) {
        this.debug = debug
        return this
    }

    public setRouter(router: Router) {
        this.router = router
        return this
    }

    public static create(directory: string) {
        return new RouterFileBaseRoutingService().setDirectory(directory)
    }

    public async loadFiles() {
        const files = fg.sync('**/*.ts', { cwd: this.directory })

        // Process all files and build route data
        const routes: RouteFileDefinition[] = []

        for (const file of files) {
            // Remove .ts extension
            let routePath = file.replace(/\.ts$/, '')
            
            // Determine HTTP method from suffix
            let method: 'get' | 'post' | 'patch' | 'delete' | 'put' = 'get'
            const methodSuffixes = ['.post', '.patch', '.delete', '.put']
            
            for (const suffix of methodSuffixes) {
                if (routePath.endsWith(suffix)) {
                    method = suffix.substring(1) as any
                    routePath = routePath.replace(suffix, '')
                    break
                }
            }
            
            // Convert file path to route path
            // Replace 'index' with empty string for index routes
            routePath = routePath.replace(/\/index$/, '')
            routePath = routePath.replace(/^index$/, '')
            
            // Convert [...name] to /:name(.*) for named catch-all routes
            routePath = routePath.replace(/\[\.\.\.([^\]]+)]/g, '*$1')
            
            // Convert [param] to :param for route parameters
            routePath = routePath.replace(/\[([^\]]+)]/g, ':$1')
            
            // Ensure route starts with /
            if (!routePath.startsWith('/')) {
                routePath = '/' + routePath
            }
            
            // Handle root index case
            if (routePath === '/') {
                routePath = '/'
            }
            
            // Apply prefix if provided
            if (this.prefix) {
                const normalizedPrefix = this.prefix.startsWith('/') ? this.prefix : '/' + this.prefix
                routePath = normalizedPrefix + routePath
            }
            
            // Calculate sort key for prioritization
            let sortKey = 0
            
            // Catch-all routes should come last (high sort key)
            if (routePath.includes('*')) {
                sortKey += 1000000
            }
            
            // Count parameters (routes with fewer params come first)
            const paramCount = (routePath.match(/:/g) || []).length
            sortKey += paramCount * 10000
            
            // Count segments (routes with more segments come first, so we subtract)
            const segmentCount = routePath.split('/').filter(s => s).length
            sortKey -= segmentCount * 100
            
            routes.push({
                file,
                routePath,
                method,
                sortKey 
            })
        }
        
        // Sort routes by specificity (lower sortKey = more specific = registered first)
        routes.sort((a, b) => a.sortKey - b.sortKey)

        this.routes = routes
    }

    public async registerRoutes() {
        if (!this.router) {
            throw new BaseException('Router instance not set')
        }

        for (const route of this.routes) {
            const routeModule = await import(`${this.directory}/${route.file}`)
            const handler = routeModule.default

            if (typeof handler !== 'function') {
                this.logger.warn(`Route file ${route.file} does not export a default function`)
                continue
            }

            this.router[route.method](route.routePath, handler)
        }
    }

    public async load(){

        await this.loadFiles()
        await this.registerRoutes()

    }
}
