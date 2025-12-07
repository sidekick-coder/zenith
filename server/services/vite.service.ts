import fs from 'fs'
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
import { basePath, clientPath } from '#server/utils/paths.ts'
import router from '#server/facades/router.facade.ts'
import auth from '#server/facades/auth.facade.ts'
import assets from '#server/facades/assets.facade.ts'
import type User from '#server/entities/user.entity.ts'
import Permission from '#server/entities/permission.entity.ts'
import ConfigService from '#shared/services/config.service.ts'
import DIService from '#shared/services/di.service.ts'
import type ViteEntryPointService from '#shared/services/viteEntryPoint.service.ts'

export default class ViteService {
    public logger = logger.child({ label: 'vite' })
    public server: ViteDevServer | undefined
    public entrypoint: ViteEntryPointService | null = null
    public debug: boolean
    public container: Map<string, any>

    constructor(data: Partial<ViteService> = {}) {
        this.container = new Map<string, any>()
        this.debug = data.debug ?? false
    }

    public addToContainer(key: string, value: any) {
        this.container.set(key, value)
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

        const clientConfig = new ConfigService()

        clientConfig.loadFromEntries(Object.entries(env.get('CLIENT_CONFIG') || {}), 'env')

        clientConfig.set('site', config.get('site', {}))
        clientConfig.set('branding', config.get('branding', {}))
        clientConfig.set('auth', config.get('auth', {}))

        const options = {
            config: clientConfig.toRecord(),
            logger: this.logger,
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
        viteLogger.error = (msg, opts) => log(msg, opts)

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
    }

    public async load(app: Application) {
        await this.loadServer(app)
        await this.loadEntryNode()
    }

    public async handle(url: string, _request: Request, response: Response) {
        try {
            const template = env.get('NODE_ENV') === 'production' 
                ? fs.readFileSync(basePath('client-dist', 'browser', 'client', 'index.html'), 'utf-8')
                : await this.server!.transformIndexHtml(url, fs.readFileSync(clientPath('index.html'), 'utf-8'))

            const render = env.get('NODE_ENV') === 'production'
                ? (await import(basePath('client-dist', 'node', 'entry-server.js'))).render
                : (await this.server!.ssrLoadModule('/client/entry-server.ts')).render

            const container = new DIService()

            for (const [key, value] of this.container.entries()) {
                container.set(key, JSON.parse(JSON.stringify(value)))
            }

            const clientConfig = new ConfigService()

            clientConfig.loadFromEntries(Object.entries(env.get('CLIENT_CONFIG') || {}), 'env')

            clientConfig.set('site', config.get('site', {}))
            clientConfig.set('branding', config.get('branding', {}))
            clientConfig.set('auth', config.get('auth', {}))

            container.set('setup', config.get('setup') || {})
            container.set('state', {})
            container.set('permissions', [] as Permission[])
            container.set('user:metas', {} as Record<string, any>)
            container.set('preferences:dark_mode', false)
            
            const cookies = new CookieService(_request, response)

            const token = cookies.get('Authorization', '') 
                || _request.headers['authorization'] as string
                || ''

            if (token) {                
                container.set('auth:user', await auth.authenticate(token))
            }

            if (container.get('auth:user')) {
                const user = container.get('auth:user') as User
                const permissions = Permission.applyContext(user.permissions, {
                    auth: {
                        user: user
                    },
                })

                const metas = await user.$metas.all()

                container.set('permissions', permissions)
                container.set('user:metas', metas)
                container.set('preferences:dark_mode', metas['admin-ui:dark_mode'] ?? false)
            }

            

            const ctx = {
                url,
                router,
                container: container.toRecord(),
                config: clientConfig.toRecord(),
                logger: this.logger,
                cookies:  cookies.toObject(),
            }

            const rendered = await render(ctx)

            let head = rendered.head ?? ''
            const body = rendered.html ?? ''

            // inject assets from assets facade
            head += this.getAssetsHtml()

            // only inject styles in development mode, to prevent layout shifts
            if (env.get('NODE_ENV') !== 'production') {
                head += '<link rel="stylesheet" href="/client/assets/styles.css">'
            }

            // state
            head += `<script>
                window.__CONTAINER__ = ${JSON.stringify(ctx.container)}
                window.__CONFIG__ = ${JSON.stringify(ctx.config)}
            </script>`

            // Replace app-html first
            let html = template.replace('<!--app-html-->', body)
            
            // Add dark class to html tag if dark mode is enabled
            if (container.get('preferences:dark_mode')) {
                html = html.replace('<html', '<html class="dark"')
            }
            
            // Find the last script or link tag in head and insert our head content after it
            const headEndIndex = html.indexOf('</head>')
            
            if (headEndIndex !== -1) {
                html = html.slice(0, headEndIndex) + head + '\n  ' + html.slice(headEndIndex)
            }

            response.status(200).set({ 'Content-Type': 'text/html' })
                .end(html)
        } catch (e) {
            this.logger.error('Error during Vite SSR render', e)
            const error = e as Error
            this.server?.ssrFixStacktrace(error)
            console.error(error.stack)
            response.status(500).end(error.stack)
        }
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

