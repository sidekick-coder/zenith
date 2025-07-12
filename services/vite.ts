import type { Application } from "express"
import { createServer as createViteServer, type ViteDevServer } from 'vite'
import fs from 'fs'
import path from 'path'
import express from 'express'
import { basePath } from "../utils/paths.ts"
const __dirname = path.dirname(new URL(import.meta.url).pathname)

interface InitOptions {
    mode: 'prod' | 'dev'
}

export class Vite {
    public async init(app: Application, options?: InitOptions) {
        const isProduction = options?.mode === 'prod'
        let vite: ViteDevServer | undefined

        if (!isProduction) {
            vite = await createViteServer({
                server: { middlewareMode: true },
                appType: 'custom',
            })

            app.use(vite.middlewares)
        }

        if (options?.mode === 'prod') {
            app.use(
                express.static(path.resolve(__dirname, '../dist/client'), {
                    index: false,
                })
            )

            app.use('*all', async (req, res) => {
                const url = req.originalUrl

                const template = fs.readFileSync(
                    path.resolve(__dirname, '../dist/client/index.html'),
                    'utf-8'
                )

                const manifest = require('../dist/client/ssr-manifest.json')
                const { render } = require('../dist/server/entry-server.js')
                const appHtml = await render(url, manifest)

                const html = template.replace(`<!--ssr-outlet-->`, appHtml)
                res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
            })
        }


        app.use('*all', async (req, res) => {
            const url = req.originalUrl

            try {
                let template: string = ''
                let render: any

                if (isProduction) {
                    template = fs.readFileSync(basePath('client', 'dist', 'index.html'), 'utf-8')
                    render = (await import(basePath('client', 'dist', 'entry-server.js'))).render
                }

                if (!isProduction) {
                    template = fs.readFileSync(basePath('client', 'index.html'), 'utf-8')
                    template = await vite!.transformIndexHtml(url, template)
                    render = (await vite!.ssrLoadModule('/client/entry-server.ts')).render
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

export default new Vite();
