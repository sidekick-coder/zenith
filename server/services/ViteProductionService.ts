import fs from 'fs'
import type { Application } from 'express'
import type { Request, Response } from 'express'
import { transformHtmlTemplate } from '@unhead/vue/server'
import { basePath, PageRequestContextEntity } from '@sidekick-coder/zenith-kit/server'
import express from 'express'
import type { ManifestChunk } from 'vite'
import type { ResolvableLink, ResolvableScript } from '@unhead/vue'
import { BaseException } from '@sidekick-coder/zenith-kit/shared'
import ViteService from './ViteService.ts'
import router from '#server/facades/router.facade.ts'
import El from '#server/entities/el.entity.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import emmitter from '#server/facades/emmitter.facade.ts'
import type { EntryNodeRenderFunction } from '#shared/contracts/EntryNodeRenderContract.ts'


export default class ViteProductionService extends ViteService {
    public renderFn: EntryNodeRenderFunction | null = null
    public manifest: Record<string, ManifestChunk> = {}

    public async loadManifest() {

        const filename = basePath('dist', 'client-browser', '.vite', 'manifest.json')

        if (!fs.existsSync(filename)) {
            throw new BaseException('manifest not found, make sure to build the client before starting the server')
        }

        const text = fs.readFileSync(filename, 'utf-8')

        this.manifest = JSON.parse(text)
    }

    public async loadRenderFn() {
        const start = Date.now()

        if (this.debug) {
            this.logger.debug('loading vite entrypoint')
        }

        const filename = basePath('dist', 'client-node', 'entry-node.js')

        if (!fs.existsSync(filename)) {
            throw new BaseException('entrypoint not found, make sure to build the client before starting the server')
        }

        const mod = await import(filename)

        if (!mod) {
            throw new BaseException('failed to load entrypoint module')
        }

        this.renderFn = mod.default || mod

        if (!this.renderFn) {
            throw new BaseException('failed to load entrypoint')
        }

        if (this.debug) {
            this.logger.debug(`entrypoint loaded in ${Date.now() - start}ms`)
        }
    }
    public async load(app: Application) {

        await this.loadManifest()
        await this.loadRenderFn()

        app.use(express.static(basePath('dist', 'client-browser')))
    }

    public chunksToHead(manifest: Record<string, ManifestChunk>, entry: string): { scripts: ResolvableScript[], links: ResolvableLink[] } {
        const chunk = manifest[entry]

        if (!chunk) {
            throw new BaseException(`entry ${entry} not found in manifest`)
        }

        const scripts: ResolvableScript[] = []
        const links: ResolvableLink[] = []
        const visited = new Set<string>()

        const collectChunk = (key: string) => {
            if (visited.has(key)) return
            visited.add(key)

            const c = manifest[key]

            if (!c) return

            if (c.css) {
                for (const css of c.css) {
                    links.push({
                        rel: 'stylesheet',
                        href: `/${css}`,
                    })
                }
            }

            if (c.imports) {
                for (const imported of c.imports) {
                    const importedChunk = manifest[imported]

                    if (importedChunk) {
                        links.push({
                            rel: 'modulepreload',
                            href: `/${importedChunk.file}`,
                        })
                    }

                    collectChunk(imported)
                }
            }
        }

        collectChunk(entry)

        scripts.push({
            src: `/${chunk.file}`,
            type: 'module',
            defer: true,
        })

        return {
            scripts,
            links
        }
    }

    public async render(ctx: PageRequestContextEntity): Promise<string> {
        if (!this.renderFn) {
            throw new Error('Vite entrypoint not loaded')
        }

        const html = new El('html')

        const head = html.child('head')

        const body = html.child('body')

        // add importmap 
        head.child('script')
            .attr('type', 'importmap')
            .html(JSON.stringify({ imports: { 'vue': '/api/vendor/vue', } }))


        const { links, scripts } = this.chunksToHead(this.manifest, 'client/entry-browser.ts')

        ctx.head.push({
            link: links,
            script: scripts,
        } as any)

        await emmitter.emitAndWait('page:request:before-render', ctx)

        if (this.debug) {
            this.logger.debug('render page', {
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

            this.logger.error(error.message, error)

            response.status(status).end(error.stack)

            return
        }

        return response
            .status(200)
            .set({ 'Content-Type': 'text/html' })
            .end(html)
    }
}

