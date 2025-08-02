import express from 'express'
import cookieParser from 'cookie-parser'
import type {
    CookieOptions, Request, Response 
} from 'express'
import vite from './server/services/vite.service.ts'

import logger from './server/facades/logger.facade.ts'
import type Route from '#server/router/route.ts'
import router from '#server/facades/router.facade.ts'
import db from '#server/facades/db.facade.ts'
import { tryCatch } from '#common/tryCatch.ts'
import type { HttpContext } from '#server/router/types.ts'
import BaseException from '#server/exceptions/base.ts'
import { basePath } from '#server/utils/paths.ts'
import modules from '#server/services/modules.service.ts'

function handleError(error: Error, response: Response) {
    logger.error('Error occurred while processing request', {
        error: error.message,
        stack: error.stack,
    })

    if (error instanceof BaseException) {
        return response.status(error.statusCode).json({
            error: error.name,
            message: error.message,
        })
    }

    response.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
    })
}

async function execute(url: URL, request: Request, response: Response, route: Route) {        
    const ctx: HttpContext = {
        url: url.pathname,
        method: request.method.toLowerCase(),
        params: router.extractParams(route.path, url.pathname),
        query: Object.fromEntries(url.searchParams.entries()),
        body: request.body,
        cookie: {
            get(name: string) {
                return request.cookies?.[name]
            },
            set(name, value, cookiOptions) {
                const options: CookieOptions = {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    ...cookiOptions
                }

                response.cookie(name, value, options)
            }
        }
    }

    const [error, result] = await tryCatch(() => router.execute(route, ctx))

    if (error) {
        handleError(error, response)
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

async function loadRoutes(){
    router.clear()

    await router.loadDirectory(basePath('router', 'routes'))

    // load module routes
    const mods = await modules.list({ enabled: true })

    for await (const mod of mods) {
        await mod.loadRoutes()
    }
}

async function main() {
    const app = express()

    app.use(cookieParser())
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    await vite.init(app)

    await loadRoutes()

    await db.load()

    app.use('*all', (req, res) => {
        const url = new URL(req.originalUrl, `http://${req.headers.host}`)
        const method = req.method.toLowerCase()

        const route = router.resolve(method, url.pathname)

        if (route) {
            logger.debug(`${method.toUpperCase()} ${url.pathname}`)
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
        logger.info('Server started at http://localhost:3000', {
            pid: process.pid,
            env: process.env.NODE_ENV,
        })
    })
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
