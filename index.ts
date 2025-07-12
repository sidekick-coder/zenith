import express, { type Request, type Response } from 'express'
import vite from './services/vite.ts'
import { importAll } from './utils/importAll.ts'
import path from 'path'
import schedule from 'node-schedule'

import './logger.ts'

const isProd = process.env.NODE_ENV === 'production'

async function createServer() {
    const app = express()

    const routes = await importAll(path.join(import.meta.dirname, 'routes'))

    Object.entries(routes).forEach(([filename, m]) => {
        const route = m.router

        if (!route) {
            logger.debug(`No route found in ${filename}`)
            return
        }

        logger.debug(`registering route from ${filename}`)

        app.use(route)
    })


    const routines = await importAll(path.join(import.meta.dirname, 'routines'))

    Object.entries(routines).forEach(([filename, m]) => {
        const routine = m.default

        if (!routine || !routine.cron || !routine.execute) {
            logger.debug(`No routine found in ${filename}`)
            return
        }

        logger.debug(`registering routine from ${filename}`)

        // Schedule the routine to run every minute
        schedule.scheduleJob(routine.cron, routine.execute)
    })


    await vite.init(app, {
        mode: isProd ? 'prod' : 'dev',
    })

    app.listen(3000, () => {
        logger.info('Server started at http://localhost:3000')
    })
}

createServer().catch((err) => {
    console.error(err)
    process.exit(1)
})
