import type { Application } from "express"
import { createServer as createViteServer, type ViteDevServer } from 'vite'
import fs from 'fs'
import express from 'express'
import { basePath } from "../utils/paths.ts"
import env from "../env.ts"
import type { HttpContext } from "./router.service.ts"

const isProduction = env.NODE_ENV === 'production'

export class ViteServer {
    private vite: ViteDevServer | undefined

    public async render(url: string, ctx: HttpContext) {
        try {
            let template: string = ''
            let render: any

            if (isProduction) {
                template = fs.readFileSync(basePath('app', 'dist', 'client', 'index.html'), 'utf-8')
                render = (await import(basePath('app', 'dist', 'server', 'entry-server.js'))).render
            }

            if (!isProduction) {
                template = fs.readFileSync(basePath('index.html'), 'utf-8')
                template = await this.vite!.transformIndexHtml(url, template)
                render = (await this.vite!.ssrLoadModule('/app/entry-server.ts')).render
            }

            const rendered = await render(url)

            let head = rendered.head ?? ''
            let body = rendered.html ?? ''

            // only inject styles in development mode
            if (!isProduction) {
                head += '<link rel="stylesheet" href="/style.css">'
            }

            const html = template
                .replace(`<!--app-head-->`, head)
                .replace(`<!--app-html-->`, body)

            ctx.response.status(200).set({ 'Content-Type': 'text/html' }).end(html)
        } catch (e) {
            this.vite?.ssrFixStacktrace(e)
            console.log(e.stack)
            ctx.response.status(500).end(e.stack)
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

