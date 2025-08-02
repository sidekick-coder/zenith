import fs from 'fs'
import type { Application } from 'express'
import { createServer as createViteServer  } from 'vite'
import type { ViteDevServer } from 'vite'
import express from 'express'
import type { Request, Response } from 'express'
import logger from '../logger.ts'
import { basePath } from '../utils/paths.ts'
import env from '../env.ts'
import config from './config.service.ts'
import router from '#facades/router.ts'
import auth from '#facades/auth.ts'

const isProduction = env.NODE_ENV === 'production'

export class ViteServer {
    private vite: ViteDevServer | undefined

    public async render(url: string,_request: Request, response: Response) {
        try {
            const template = isProduction 
                ? fs.readFileSync(basePath('app', 'dist', 'client', 'index.html'), 'utf-8')
                : await this.vite!.transformIndexHtml(url, fs.readFileSync(basePath('index.html'), 'utf-8'))

            const render = isProduction
                ? (await import(basePath('app', 'dist', 'server', 'entry-server.js'))).render
                : (await this.vite!.ssrLoadModule('/app/entry-server.ts')).render

                
            const state: Record<string, any> = {
                'auth:user': null,
                'setup': config.get('setup') || {},
            }

            if (state.setup.user) {
                state['auth:user'] = await auth.authenticate(_request.cookies['Authorization'] || '')
            }

            console.log(state)

            const rendered = await render({
                url,
                router,
                state
            })

            let head = rendered.head ?? ''
            const body = rendered.html ?? ''

            // only inject styles in development mode
            if (!isProduction) {
                head += '<link rel="stylesheet" href="/app/style.css">'
            }

            // state
            head += `<script>window.__INITIAL_STATE__ = ${JSON.stringify(state)}</script>`

            const html = template
                .replace('<!--app-head-->', head)
                .replace('<!--app-html-->', body)

            response.status(200).set({ 'Content-Type': 'text/html' }).end(html)
        } catch (e) {
            logger.error('Error during Vite SSR render', {
                error: e,
                label: 'vite' 
            })
            const error = e as Error
            this.vite?.ssrFixStacktrace(error)
            console.log(error.stack)
            response.status(500).end(error.stack)
        }
    }
    
    public async init(app: Application) {
        if (!isProduction) {
            this.vite = await createViteServer({
                server: { middlewareMode: true },
                appType: 'custom',
            })

            app.use(this.vite.middlewares)
        }

        if (isProduction) {
            app.use(express.static(basePath('app', 'dist', 'client')))
        }
    }
}

const vite = new ViteServer()

export default vite

