import express from 'express'
import cookieParser from 'cookie-parser'
import type { Request,  Response } from 'express'
import cors from 'cors'
import vite from './server/services/vite.service.ts'
import logger from './server/facades/logger.facade.ts'
import type Route from '#server/entities/route.entity.ts'
import router from '#server/facades/router.facade.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import type { HttpContext } from '#server/contracts/router.contract.ts'
import errorService from '#server/services/error.service.ts'
import config from '#server/facades/config.facade.ts'
import env from '#server/env.ts'
import server from '#server/facades/server.facade.ts'
import CookieService from '#server/services/cookie.service.ts'
import encrypt from '#server/facades/encrypt.facade.ts'
import drive from '#server/facades/drive.facade.ts'
import UploadService from '#server/services/upload.service.ts'

async function execute(url: URL, request: Request, response: Response, route: Route) {
    const ctx: HttpContext = {
        response,
        request,

        url: url.pathname,
        method: request.method.toLowerCase(),
        params: router.extractParams(route.path, url.pathname),
        query: Object.fromEntries(url.searchParams.entries()),
        body: request.body,
        
        upload: new UploadService(request, response),
        cookie: new CookieService(request, response)
    }

    const [error, result] = await tryCatch(() => router.execute(route, ctx))

    if (error) {
        errorService.handle(error, response)
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

function parser(req: Request, res: Response, next: express.NextFunction) {
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

async function main() {
    const app = express()

    app.use(cookieParser())
    app.use(parser)

    await vite.init(app)
    await config.loadAndWatch()
    
    if (config.has('app.key')) {
        encrypt.load(config.get('app.key'))
    }

    drive.load()
    
    await server.booter.bootAndWatch()

    const origins = config.get('cors.origins', '').split(',')
        .map((o: string) => o.trim())
        .filter((o: string) => o.length > 0)

    app.use(cors({
        credentials: true,
        origin: origins.length > 0 ? origins : undefined,
    }))

    app.use('*all', (req, res) => {
        const url = new URL(req.originalUrl, `http://${req.headers.host}`)
        const method = req.method.toLowerCase()

        const route = router.resolve(method, url.pathname)

        if (route) {            
            router.logger.debug(`${method.toUpperCase()} ${url.pathname}`)
            return execute(url, req, res, route)
        }

        if (url.pathname.startsWith('/api/')) {
            return res.status(404).json({
                error: 'Not Found',
                message: `No API route found for ${method.toUpperCase()} ${url}`,
            })
        }

        return vite.render(req.originalUrl, req, res)
    })

    app.listen(3000, () => {
        logger.info(`server started at ${env.APP_URL}`, {
            label: 'server',
            pid: process.pid,
            env: env.NODE_ENV,
        })

    })
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})

process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err)
})
