import express from 'express'
import type { Request, Response } from 'express'
import vite from './services/vite.service.ts'

import type Route from '#router/route.ts'
import logger from './logger.ts'
import router from '#facades/router.ts'
import db from '#facades/db.ts'
import { tryCatch } from '#common/tryCatch.ts'
import type { HttpContext } from '#router/types.ts'

async function execute(url: URL, request: Request, response: Response, route: Route) {        
    const ctx: HttpContext = {
        params: request.params,
        query: Object.fromEntries(url.searchParams.entries()),
        body: request.body,
    }

    console.log(ctx)

    const [error, result] = await tryCatch(() => route.handler(ctx)) 

    if (error) {
        response.status(500).send(`Internal Server Error: ${error.message}`)
        return
    }

    if (response.headersSent) {
        return // if headers are already sent, do not modify the response
    }

    // headers not set 
    response.status(200)

    if (typeof result === 'object' || Array.isArray(result)) {
        response.setHeader('Content-Type', 'application/json')
    }

    response.send(result)
}

async function main() {
    const app = express()

    app.use(express.json())
    app.use(express.urlencoded({
        extended: true 
    }))

    await vite.init(app)

    await router.load()

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
