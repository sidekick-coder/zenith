import express from 'express'
import cookieParser from 'cookie-parser'
import type {
    CookieOptions, 
    Request, 
    Response 
} from 'express'
import multer from 'multer'
import vite from './server/services/vite.service.ts'
import logger from './server/facades/logger.facade.ts'
import type Route from '#server/router/route.ts'
import router from '#server/facades/router.facade.ts'
import { tryCatch } from '#shared/tryCatch.ts'
import type { HttpContext } from '#server/router/types.ts'
import errorService from '#server/services/error.service.ts'
import bootService from '#server/services/boot.service.ts'
import config from '#server/facades/config.facade.ts'
import env from '#server/env.ts'
import build from '#server/services/build.service.ts'

const upload = multer({ storage: multer.memoryStorage(), })

async function execute(url: URL, request: Request, response: Response, route: Route) {        

    const file: HttpContext['file'] = (name: string) => {
        return new Promise<Express.Multer.File | undefined>((resolve, reject) => {
            const single = upload.single(name)

            single(request, response, (err) => {
                if (err) {
                    return reject(err)
                }

                const file = (request as any)[name] as Express.Multer.File | undefined

                if (!file) {
                    return resolve(undefined)
                }

                resolve(file)
            })

        })
    }

    const files: HttpContext['files'] = (name: string) => {
        return new Promise<Express.Multer.File[] | undefined>((resolve, reject) => {
            const multiple = upload.array(name)

            multiple(request, response, (err) => {
                if (err) {
                    return reject(err)
                }

                const files = (request as any)[name] as Express.Multer.File[] | undefined

                if (!files || files.length === 0) {
                    return resolve(undefined)
                }

                resolve(files)
            })
        })
    }

    const cookie: HttpContext['cookie'] = {
        get(name: string) {
            return request.cookies?.[name]
        },
        set(name: string, value: string, options?: CookieOptions) {
            const opts: CookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                ...options
            }

            response.cookie(name, value, opts)
        }
    }

    const ctx: HttpContext = {
        url: url.pathname,
        method: request.method.toLowerCase(),
        params: router.extractParams(route.path, url.pathname),
        query: Object.fromEntries(url.searchParams.entries()),
        body: request.body,
        file,
        files,
        cookie
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
        logger.info('server started at http://localhost:3000', {
            label: 'server',
            pid: process.pid,
            env: env.NODE_ENV,
        })

        bootService.boot()
    })
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
