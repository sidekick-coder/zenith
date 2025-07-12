import type { Application } from "express"
import { createServer as createViteServer, type ViteDevServer } from 'vite'
import fs from 'fs'
import path from 'path'
import express from 'express'
import { basePath } from "../utils/paths.ts"
import env from "../env.ts"
const __dirname = path.dirname(new URL(import.meta.url).pathname)

const isProduction = env.NODE_ENV === 'production'

export class ViteServer {
    public async init(app: Application) {
        let vite: ViteDevServer | undefined

        if (!isProduction) {
            vite = await createViteServer({
                server: { middlewareMode: true },
                appType: 'custom',
            })

            app.use(vite.middlewares)
        }

        if (isProduction) {
            app.use(express.static(basePath('client', 'dist', 'client')))
        }

        app.use('*all', async (req, res) => {
            const url = req.originalUrl

            try {
                let template: string = ''
                let render: any

                if (isProduction) {
                    template = fs.readFileSync(basePath('app', 'dist', 'client', 'client', 'index.html'), 'utf-8')
                    render = (await import(basePath('app', 'dist', 'server', 'entry-server.js'))).render
                }

                if (!isProduction) {
                    template = fs.readFileSync(basePath('app', 'index.html'), 'utf-8')
                    template = await vite!.transformIndexHtml(url, template)
                    render = (await vite!.ssrLoadModule('/app/entry-server.ts')).render
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

                res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
            } catch (e) {
                vite?.ssrFixStacktrace(e)
                console.log(e.stack)
                res.status(500).end(e.stack)
            }
        })
    }
}

const vite = new ViteServer()

export default vite

