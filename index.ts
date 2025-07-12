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
        const url = req.originalUrl
        const method = req.method.toLowerCase()

        logger.debug(`${method.toUpperCase()} ${url}`)

        const ctx: HttpContext = {
            request: req,
            response: res,
        }

        const route = router.resolve(method, url)

        if (route){
            return router.execute(method, url, ctx)
        }

        return vite.render(url, ctx)
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
