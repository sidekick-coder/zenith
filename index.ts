import express from 'express'
import vite from './services/vite.service.ts'

import type { HttpContext } from './services/router.service.ts'
import router from './services/router.service.ts'
import logger from './logger.ts'

async function createServer() {
    const app = express()

    await vite.init(app)

    await router.load()

    app.use('*all', (req, res) => {
        const url = new URL(req.originalUrl, `http://${req.headers.host}`)
        const method = req.method.toLowerCase()

        const ctx: HttpContext = {
            params: req.params,
            request: req,
            response: res,
        }

        const route = router.resolve(method, url.pathname)

        if (route) {
            logger.debug(`${method.toUpperCase()} ${url.pathname}`)
            return router.execute(method, url.pathname, ctx)
        }

        if (url.pathname.startsWith('/api/')) {
            return res.status(404).json({
                error: 'Not Found',
                message: `No API route found for ${method.toUpperCase()} ${url}`,
            })
        }

        return vite.render(req.originalUrl, ctx)
    })

    app.listen(3000, () => {
        logger.info('Server started at http://localhost:3000', {
            pid: process.pid,
            env: process.env.NODE_ENV,
        })
    })
}

createServer().catch((err) => {
    console.error(err)
    process.exit(1)
})
