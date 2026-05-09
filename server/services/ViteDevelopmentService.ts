import { stripVTControlCharacters } from 'util'
import type { Application } from 'express'
import type { ViteDevServer } from 'vite'
import { createLogger, createServer as createViteServer } from 'vite'
import type { Request, Response } from 'express'
import { transformHtmlTemplate } from '@unhead/vue/server'
import { basePath, PageRequestContextEntity } from '@sidekick-coder/zenith-kit/server'
import { LoggerService } from '@sidekick-coder/zenith-kit/shared'
import ViteService from './ViteService.ts'
import router from '#server/facades/router.facade.ts'
import El from '#server/entities/el.entity.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import emmitter from '#server/facades/emmitter.facade.ts'
import BaseException from '#server/exceptions/base.ts'
import type { EntryNodeRenderFunction } from '#shared/contracts/EntryNodeRenderContract.ts'

export interface ViteServiceOptions {
    debug?: boolean
    logger?: LoggerService
}

export default class ViteDevelopmentService extends ViteService {
    public server: ViteDevServer
    public renderFn: EntryNodeRenderFunction | null = null

    public async loadRenderFn() {
        if (!this.server) {
            throw new BaseException('Vite server not loaded')
        }

        const start = Date.now()

        if (this.debug) {
            this.logger.debug('loading vite entrypoint')
        }

        let mod: any | null = null

        mod = await this.server.ssrLoadModule(basePath('client', 'entry-node.ts')) as any

        if (!mod) {
            throw new BaseException('Failed to load Vite entrypoint module')
        }

        this.renderFn = mod.default || mod

        if (!this.renderFn) {
            throw new BaseException('Failed to load Vite entrypoint')
        }

        if (this.debug) {
            this.logger.debug(`vite entrypoint loaded in ${Date.now() - start}ms`)
        }
    }

    public async loadServer(app: Application) {
        const viteLogger = createLogger()

        viteLogger.info = (msg, opts) => {
            this.logger.info(stripVTControlCharacters(msg), opts)
        }

        viteLogger.warn = (msg, opts) => {
            this.logger.warn(stripVTControlCharacters(msg), opts)
        }

        viteLogger.error = (msg, opts) => {
            this.logger.error(stripVTControlCharacters(msg), opts)
        }

        this.server = await createViteServer({
            customLogger: viteLogger,
            server: { middlewareMode: true },
            appType: 'custom',
            configFile: basePath('vite.config.ts'),
        })

        app.use(this.server.middlewares)

        if (this.debug) {
            this.logger.debug('vite server loaded in middleware mode')
        }
    }

    public async load(app: Application) {
        await this.loadServer(app)
        await this.loadRenderFn()
    }

    public async render(ctx: PageRequestContextEntity): Promise<string> {
        if (!this.renderFn) {
            throw new Error('Vite entrypoint not loaded')
        }

        const html = new El('html')

        html.child('head')

        const body = html.child('body')

        ctx.head.push({
            link: [
                {
                    rel: 'stylesheet',
                    href: '/client/assets/styles.css'
                },
            ],
            script: [
                {
                    type: 'module',
                    src: '/client/entry-browser.ts'
                },
            ],
        })

        await emmitter.emitAndWait('page:request:before-render', ctx)

        if (this.debug) {
            this.logger.debug('rendering page with Vite SSR', {
                url: ctx.url,
                state: ctx.nodeState,
                container: ctx.nodeContainer.toRecord(),
                config: ctx.nodeConfig.toRecord(),
            })
        }

        const rendered = await this.renderFn({
            url: ctx.url,
            cookies: ctx.cookies.toRecord(),
            config: ctx.nodeConfig.toRecord(),
            container: ctx.nodeContainer.toRecord(),
            state: Object.fromEntries(ctx.nodeState),
            serverRouter: router,
            logger: this.logger,
            head: ctx.head,
        })

        // update state
        for (const [key, value] of Object.entries(rendered.state || {})) {
            ctx.browserState.set(key, value)
        }

        body
            .child('script')
            .attr('type', 'text/javascript')
            .attr('defer', 'defer')
            .attr('id', 'initial-state')
            .html(`
                window.__STATE__ = ${JSON.stringify(Object.fromEntries(ctx.browserState))};
                window.__CONTAINER__ = ${JSON.stringify(ctx.browserContainer.toRecord())};
                window.__CONFIG__ = ${JSON.stringify(ctx.browserConfig.toRecord())};
            `)

        body
            .child('div')
            .attr('id', 'app')
            .html(rendered.html || '')

        let result = html.toString()

        result = await transformHtmlTemplate(rendered.head, result)

        await emmitter.emitAndWait('page:request:after-render', ctx)

        return result
    }

    public async handle(request: Request, response: Response) {
        const url = request.originalUrl

        if (!this.renderFn) {
            throw new BaseException('Vite entrypoint not loaded')
        }

        if (!this.server) {
            throw new BaseException('Vite server not loaded')
        }

        const ctx = new PageRequestContextEntity({
            url,
            request,
            response,
        })

        await emmitter.emitAndWait('page:request:start', ctx)

        const [error, html] = await tryCatch(() => this.render(ctx))

        if (error) {
            Object.assign(error, { url })

            const status = (error as any).status || 500

            this.logger.error('Error during Vite SSR render', error)

            this.server.ssrFixStacktrace(error)

            response.status(status).end(error.stack)

            return
        }

        return response
            .status(200)
            .set({ 'Content-Type': 'text/html' })
            .end(html)
    }

    public async close() {
        if (!this.server) return

        await this.server.close()

        if (this.debug) {
            this.logger.debug('vite server closed')
        }
    }
}

