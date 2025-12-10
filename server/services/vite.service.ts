import { stripVTControlCharacters } from 'util'
import fs from 'fs'
import type { Application } from 'express'
import { createLogger, createServer as createViteServer  } from 'vite'
import type { ViteDevServer } from 'vite'
import express from 'express'
import type { Request, Response } from 'express'
import { transformHtmlTemplate } from '@unhead/vue/server'
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
import { compose } from '#shared/utils/compose.ts'
import { Hooks } from '#server/mixins/hooks.mixin.ts'

interface HandleOptions {
    url: string;
    request: Request;
    response: Response;
}

export interface ViteServiceEvents {
    'vite:render': {
        head: El;
        html: El;
        body: El;
        options: RenderOptions;
        vite: ViteService;
    };
}

export default class ViteService extends compose(Hooks) {
    public logger = logger.child({ label: 'vite' })
    public server: ViteDevServer | undefined
    public entrypoint: ViteEntryPointService | null = null
    public debug: boolean
    public state: Map<string, any>
    public clientConfig: ConfigService
    public clientContainer: DIService

    constructor(data: Partial<ViteService> = {}) {
        super()

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
        const start = Date.now()

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

        if (this.debug) {
            this.logger.debug(`vite entrypoint loaded in ${Date.now() - start}ms`)
        }
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

    public async head(head: El) {
        head
            .child('meta')
            .attr('name', 'viewport')
            .attr('content', 'width=device-width, initial-scale=1')

        if (env.get('NODE_ENV') !== 'production') {
            head
                .child('link')
                .attr('rel', 'stylesheet')
                .attr('href', '/client/assets/styles.css')
            
            head
                .child('script')
                .attr('defer', '')
                .attr('type', 'module')
                .attr('src', '/client/entry-client.ts')

            return
        }

        const [error, manifest] = await tryCatch(async () => {
            const text = await fs.promises.readFile(basePath('client-dist', 'browser', '.vite', 'manifest.json'), 'utf-8')

            return JSON.parse(text)
        })

        if (error) {
            this.logger.error('Failed to load Vite manifest', error)
            return
        }

        const index = manifest['client/index.html']

        if (!index) {
            this.logger.error('Vite manifest is missing client/index.html entry')
            return
        }

        index.css?.forEach( (file: string) => {
            head.child('link')
                .attr('rel', 'stylesheet')
                .attr('href', `/${file}`)
        })

        head.child('script')
            .attr('defer', '')
            .attr('type', 'module')
            .attr('src', `/${index.file}`)
    }

    public async render(options: RenderOptions): Promise<string> {
        if (!this.entrypoint) {
            throw new Error('Vite entrypoint not loaded')
        }

        const html = new El('html')

        // head
        const head = html.child('head')

        this.head(head)
        
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

        const rendered = await this.entrypoint.render({
            url: options.url,
            cookies: options.cookies || {},
            state: Object.fromEntries(state),
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

        await this.emitAsync('vite:render', {
            html,
            head,
            body,
            options,
            vite: this,
        })

        let result = html.toString()

        result = await transformHtmlTemplate(rendered.head, result)

        return result
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

        state.set('head', {
            title: config.get('app.name') || 'Zenith',
            htmlAttrs: { 
                lang: config.get('app.lang') || 'en',
                class: state.get('preferences:dark_mode') ? 'dark' : 'light'
            }
        })

        const options: RenderOptions = {
            url,
            cookies: cookie.toRecord(),
            state: Object.fromEntries(state),
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

    public async close() {
        if (!this.server) return
        
        await this.server.close()

        if (this.debug) {
            this.logger.debug('vite server closed')
        }
    }
}

