import fs from 'fs'
import type { Application } from 'express'
import { createServer as createViteServer  } from 'vite'
import type { ViteDevServer } from 'vite'
import express from 'express'
import type { Request, Response } from 'express'
import env from '../env.ts'
import config from '#server/facades/config.facade.ts'
import rootLogger from '#server/facades/logger.facade.ts'
import { clientPath, storagePath } from '#server/utils/paths.ts'
import router from '#server/facades/router.facade.ts'
import auth from '#server/facades/auth.facade.ts'

const isProduction = env.NODE_ENV === 'production'

const logger = rootLogger.child({ label: 'vite.service' })

export class ViteServer {
    private vite: ViteDevServer | undefined

    public async render(url: string, _request: Request, response: Response) {
        try {
            const template = isProduction 
                ? fs.readFileSync(storagePath('dist', 'client', 'client', 'index.html'), 'utf-8')
                : await this.vite!.transformIndexHtml(url, fs.readFileSync(clientPath('index.html'), 'utf-8'))

            const render = isProduction
                ? (await import(storagePath('dist', 'server', 'entry-server.js'))).render
                : (await this.vite!.ssrLoadModule('/client/entry-server.ts')).render

                
            const state: Record<string, any> = {
                'auth:user': null,
                'setup': config.get('setup') || {},
                'config': env.CLIENT_CONFIG || {},
            }

            state.config.site = config.get('site', {})

            if (state.setup.user) {
                state['auth:user'] = await auth.authenticate(_request.cookies['Authorization'] || '')
            }

            const rendered = await render({
                url,
                router,
                state,
                logger,
                cookies: _request.cookies || {},
            })

            let head = rendered.head ?? ''
            const body = rendered.html ?? ''

            // only inject styles in development mode
            if (!isProduction) {
                head += '<link rel="stylesheet" href="/client/style.css">'
            }

            // state
            head += `<script>window.__INITIAL_STATE__ = ${JSON.stringify(state)}</script>`

            const html = template
                .replace('<!--app-head-->', head)
                .replace('<!--app-html-->', body)

            response.status(200).set({ 'Content-Type': 'text/html' })
                .end(html)
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
            app.use(express.static(storagePath('dist', 'client')))
        }
    }
}

const vite = new ViteServer()

export default vite

