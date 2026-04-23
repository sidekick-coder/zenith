import type { Server } from 'node:http'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import Router from './router.service.ts'
import ExceptionService from './exception.service.ts'
import Route from '#server/entities/route.entity.ts'
import HttpContext from '#shared/entities/httpContext.entity.ts'
import CookieService from '#server/services/cookie.service.ts'
import UploadService from '#server/services/upload.service.ts'
import logger from '#server/facades/logger.facade.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import env from '#server/facades/env.facade.ts'

export interface LoadOptions {
    debug?: boolean;
    app: express.Application;
    router?: Router;
    exception?: ExceptionService;
    origins?: string[];
}

export default class ExpressService {
    public app: express.Application
    public server: Server | null = null
    public router: Router
    public exception: ExceptionService
    public logger = logger.child({ label: 'express' })
    public debug = false
    public onUnhandlerRouted: ((req: express.Request, res: express.Response) => void) | null = null

    constructor() {
        this.app = express()
        this.app.use(cookieParser())
        this.app.use(this.parser)

        this.exception = new ExceptionService()
    }

    public getExpressApp(): express.Application {
        return this.app
    }

    public cors(options: cors.CorsOptions) {
        this.app.use(cors(options))
    }

    public routes() {
        this.app.use('*all', (req, res) => {
            const url = new URL(req.originalUrl, `http://${req.headers.host}`)
            const method = req.method.toLowerCase()

            const route = this.router.resolve(method, url.pathname)

            if (this.router.debug) {
                this.router.logger.debug(`${method.toUpperCase()} ${url.pathname}`)
            }

            if (route) {

                return this.execute(url, req, res, route)
            }

            if (url.pathname.startsWith('/api/')) {
                return res.status(404).json({
                    error: 'Not Found',
                    message: `No API route found for ${method.toUpperCase()} ${url}`,
                })
            }

            if (this.onUnhandlerRouted) {
                return this.onUnhandlerRouted(req, res)
            }
        })
    }

    public parser(req: express.Request, res: express.Response, next: express.NextFunction) {
        const contentType = req.headers['content-type'] || ''

        if (contentType.startsWith('multipart/form-data')) {
            // Skip JSON and URL-encoded parsers for multipart requests
            return next()
        }

        // For other content types, parse JSON and URL-encoded body
        express.json()(req, res, (err) => {
            if (err) return next(err)

            express.urlencoded({ extended: true })(req, res, next)
        })
    }

    public async execute(url: URL, request: express.Request, response: express.Response, route: Route) {
        const ctx = new HttpContext({
            response,
            request,

            url: url.pathname,
            method: request.method.toLowerCase(),
            params: Route.params(route.path, url.pathname),
            query: Route.query(url.href),
            body: request.body,

            upload: new UploadService(request, response),
            cookie: new CookieService(request, response)
        })

        const [error, result] = await tryCatch(() => this.router.execute(route, ctx))

        if (error) {
            this.exception.handle(error, response)
            return
        }

        if (response.headersSent) {
            return // if headers are already sent, do not modify the response
        }

        if (result && result.redirect) {
            response.redirect(result.redirect)
            return
        }

        // headers not set 
        response.status(200)

        if (typeof result === 'object' || Array.isArray(result)) {
            response.setHeader('Content-Type', 'application/json')
        }

        response.send(result)
    }

    public start() {
        const port = env.get('PORT')
        const host = env.get('HOST')

        this.server = this.app.listen(port, host, () => {
            this.logger.info('server started', {
                pid: process.pid,
                port,
                host,
                env: env.get('NODE_ENV'),
            })
        })
    }

    public stop() {
        return new Promise<void>((resolve) => {
            if (!this.server) {
                this.logger.warn('server is not running')
                return resolve()
            }

            this.server.on('close', () => {
                resolve()

                this.logger.info('server stopped', {
                    pid: process.pid,
                    env: env.get('NODE_ENV'),
                })
            })

            this.server.close()

        })
    }
}
