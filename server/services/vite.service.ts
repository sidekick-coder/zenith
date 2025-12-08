import { stripVTControlCharacters } from 'util'
import type { Application } from 'express'
import { createLogger, createServer as createViteServer  } from 'vite'
import type { ViteDevServer } from 'vite'
import express from 'express'
import type { Request, Response } from 'express'
import CookieService from './cookie.service.ts'
import env from '#server/facades/env.facade.ts'
import config from '#server/facades/config.facade.ts'
import logger from '#server/facades/logger.facade.ts'
import { basePath } from '#server/utils/paths.ts'
import router from '#server/facades/router.facade.ts'
import auth from '#server/facades/auth.facade.ts'
import assets from '#server/facades/assets.facade.ts'
import type User from '#server/entities/user.entity.ts'
import Permission from '#server/entities/permission.entity.ts'
import ConfigService from '#shared/services/config.service.ts'
import DIService from '#shared/services/di.service.ts'
import type ViteEntryPointService from '#shared/services/viteEntryPoint.service.ts'
import El from '#server/entities/el.entity.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import type { RenderOptions } from '#shared/services/viteEntryPoint.service.ts'

interface HandleOptions {
    url: string;
    request: Request;
    response: Response;
}

export default class ViteService {
    public logger = logger.child({ label: 'vite' })
    public server: ViteDevServer | undefined
    public entrypoint: ViteEntryPointService | null = null
    public debug: boolean
    public state: Map<string, any>
    public clientConfig: ConfigService
    public clientContainer: DIService

    constructor(data: Partial<ViteService> = {}) {
        this.state = new Map<string, any>()
        this.debug = data.debug ?? false

        this.clientConfig = new ConfigService()
        this.clientContainer = new DIService()

        if (this.debug) {
            this.logger.debug('initialized in debug mode')
        }

    }

    public addDependency(key: string, value: any) {
        this.clientContainer.set(key, value)
    }

    public addState(key: string, value: any) {
        this.state.set(key, value)
    }

    public async loadEntryNode(){
        if (this.debug) {
            this.logger.debug('loading vite entrypoint')
        }

        let mod: { default: typeof ViteEntryPointService } | null = null

        if (env.get('NODE_ENV') == 'production') {
            mod = await import(basePath('client-dist', 'node', 'entry-server.js'))
        }

        if (this.server && env.get('NODE_ENV') !== 'production') {
            mod = await this.server.ssrLoadModule('/client/entry-server.ts') as any
        }

        if (!mod) {
            throw new Error('Failed to load Vite entrypoint module')
        }

        this.entrypoint = new mod.default()

        if (!this.entrypoint) {
            throw new Error('Failed to load Vite entrypoint')
        }

        this.clientConfig.loadFromEntries(Object.entries(env.get('CLIENT_CONFIG') || {}), 'env')

        this.clientConfig.set('site', config.get('site', {}))
        this.clientConfig.set('branding', config.get('branding', {}))
        this.clientConfig.set('auth', config.get('auth', {}))
        this.clientConfig.set('setup', config.get('setup') || {})
        this.clientConfig.set('cookie.prefix', config.get('cookie.prefix', ''))

        const options = {
            logger: this.logger,
            config: this.clientConfig.toRecord(),
            container: this.clientContainer.toRecord(),
            router: router
        }

        await this.entrypoint.load(options)
    }

    public async loadServer(app: Application) {
        if (env.get('NODE_ENV') === 'production') {
            app.use(express.static(basePath('client-dist', 'browser')))
            return
        }
        
        const viteLogger = createLogger()

        const log: typeof viteLogger.info = (msg, opts) => {
            const sanitizedMsg = stripVTControlCharacters(msg)

            if (this.debug) {
                this.logger.debug(sanitizedMsg, opts)
            }
        }

        viteLogger.info = (msg, opts) => log(msg, opts)
        viteLogger.warn = (msg, opts) => log(msg, opts)
        viteLogger.error = (msg, opts) => {
            this.logger.error(stripVTControlCharacters(msg), opts)
        }

        this.server = await createViteServer({
            customLogger: viteLogger,
            server: { middlewareMode: true },
            appType: 'custom',
            publicDir: 'client/public',
            resolve: {
                alias: {
                    'vue': 'vue/dist/vue.esm-bundler.js',
                }
            }
        })

        app.use(this.server.middlewares)

        if (this.debug) {
            this.logger.debug('vite server loaded in middleware mode')
        }
    }

    public async load(app: Application) {
        await this.loadServer(app)
        await this.loadEntryNode()
    }

    public async render(options: RenderOptions): Promise<string> {
        if (!this.entrypoint) {
            throw new Error('Vite entrypoint not loaded')
        }

        const html = new El('html')

        if (options.htmlAttrs) {
            for (const [key, value] of Object.entries(options.htmlAttrs)) {
                html.attr(key, value)
            }
        }

        // head
        const head = html.child('head')

        // meta
        head
            .child('meta')
            .attr('charset', 'utf-8')
            
        head
            .child('meta')
            .attr('name', 'viewport')
            .attr('content', 'width=device-width, initial-scale=1')

        // styles
        if (env.get('NODE_ENV') !== 'production') {
            head
                .child('link')
                .attr('rel', 'stylesheet')
                .attr('href', '/client/assets/styles.css')
        }
        
        // scripts
        head
            .child('script')
            .attr('defer', '')
            .attr('type', 'module')
            .attr('src', '/client/entry-client.ts')

       
        
        // body
        const body = html.child('body')

        // app
        const state = new Map<string, any>()

        for (const [key, value] of this.state.entries()) {
            state.set(key, value)
        }

        for (const [key, value] of Object.entries(options.state || {})) {
            state.set(key, value)
        }

        const rendered = await this.entrypoint!.render({
            url: options.url,
            cookies: options.cookies || {},
            state: Object.fromEntries(state),
            router: options.router,
        })

        // update state
        for (const [key, value] of Object.entries(rendered.state || {})) {
            state.set(key, value)
        }

        head.child('script').html(`
            window.__STATE__ = ${JSON.stringify(Object.fromEntries(state))};
            window.__CONTAINER__ = ${JSON.stringify(this.clientContainer.toRecord())};
            window.__CONFIG__ = ${JSON.stringify(this.clientConfig.toRecord())};
        `)

        body.child('div')
            .attr('id', 'app')
            .html(rendered.html || '')

        return html.toString()
    }

    public async handle({ url, response, request }: HandleOptions) {
        const cookie = new CookieService(request, response)

        const token = cookie.get('Authorization', '') 
                || request.headers['authorization'] as string
                || ''

        const state = new Map<string, any>()

        if (token) {                
            state.set('auth:user', await auth.authenticate(token))
        }

        if (state.get('auth:user')) {
            const user = state.get('auth:user') as User
            const permissions = Permission.applyContext(user.permissions, {
                auth: {
                    user: user
                },
            })

            const metas = await user.$metas.all()

            state.set('permissions', permissions)
            state.set('user:metas', metas)
            state.set('preferences:dark_mode', metas['admin-ui:dark_mode'] ?? false)
        }

        const options: RenderOptions = {
            url,
            cookies: cookie.toRecord(),
            state: Object.fromEntries(state),
            router: router,
            htmlAttrs: {}
        }

        if (state.get('preferences:dark_mode')) {
            options.htmlAttrs = { class: 'dark' }
        }

        const [error, html] = await tryCatch( () => this.render(options) )

        if (error) {
            Object.assign(error, { url })
            this.logger.error('Error during Vite SSR render', error)
            this.server?.ssrFixStacktrace(error)
            response.status(500).end(error.stack)
            return
        }
        
        return response
            .status(200)
            .set({ 'Content-Type': 'text/html' })
            .end(html)
    }

    private getAssetsHtml(): string {
        let html = ''
        
        // Get all assets from the assets service
        const allAssets = assets.getAll()
        
        for (const [name, asset] of Object.entries(allAssets)) {
            if (asset.src) {
                html += `<link data-asset="${name}" rel="stylesheet" href="${asset.src}">`
            }
            
            if (asset.content) {
                html += `<style data-asset="${name}">${asset.content}</style>`
            }
        }
        
        return html
    }
    
    

    public async close() {
        if (!this.server) return
        
        await this.server.close()

        if (this.debug) {
            this.logger.debug('vite server closed')
        }
    }
}

