import fs from 'fs'
import type { Application } from 'express'
import { createLogger, createServer as createViteServer  } from 'vite'
import type { ViteDevServer } from 'vite'
import express from 'express'
import type { Request, Response } from 'express'
import env from '../env.ts'
import CookieService from './cookie.service.ts'
import modules from '#server/facades/modules.facade.ts'
import config from '#server/facades/config.facade.ts'
import logger from '#server/facades/logger.facade.ts'
import { basePath, clientPath } from '#server/utils/paths.ts'
import router from '#server/facades/router.facade.ts'
import auth from '#server/facades/auth.facade.ts'
import assets from '#server/facades/assets.facade.ts'
import type User from '#server/entities/user.entity.ts'
import Permission from '#server/entities/permission.entity.ts'
import ConfigService from '#shared/services/config.service.ts'

const isProduction = env.NODE_ENV === 'production'

export default class ViteService {
    public logger = logger.child({ label: 'vite' })
    public server: ViteDevServer | undefined
    public debug: boolean
    public state: Map<string, any>

    constructor(data: Partial<ViteService> = {}) {
        this.state = new Map<string, any>()
        this.debug = data.debug ?? false
    }

    public addState(key: string, value: any) {
        this.state.set(key, value)
    }

    public async render(url: string, _request: Request, response: Response) {
        try {
            const template = isProduction 
                ? fs.readFileSync(basePath('client-dist', 'client', 'client', 'index.html'), 'utf-8')
                : await this.server!.transformIndexHtml(url, fs.readFileSync(clientPath('index.html'), 'utf-8'))

            const render = isProduction
                ? (await import(basePath('client-dist', 'server', 'entry-server.js'))).render
                : (await this.server!.ssrLoadModule('/client/entry-server.ts')).render

            const state = new Map<string, any>()

            for (const [key, value] of this.state.entries()) {
                state.set(key, JSON.parse(JSON.stringify(value)))
            }

            const clientConfig = new ConfigService()

            for (const [key, entry] of Object.entries(env.CLIENT_CONFIG || {})) {
                clientConfig.entries.set(key, {
                    key,
                    value: entry,
                    source: 'env'
                })
            }

            clientConfig.set('site', config.get('site', {}))
            clientConfig.set('branding', config.get('branding', {}))
            clientConfig.set('auth', config.get('auth', {}))

            state.set('setup', config.get('setup') || {})
            state.set('permissions', [] as Permission[])
            state.set('client:setups:client', [] as string[])
            state.set('client:setups:server', [] as string[])
            state.set('user:metas', {} as Record<string, any>)

            const mods = await modules.list({
                enabled: true
            })

            state.set('modules:enabled', mods.map(m => m.name))

            state.set('client:setups:client', mods
                .flatMap(m => m.files)
                .filter(f => f.type === 'setup:client' && f.context === 'client')
                .map(f => f.src)
            )

            state.set('client:setups:server', mods
                .flatMap(m => m.files)
                .filter(f => f.type === 'setup:client' && f.context === 'server')
                .map(f => f.src)
            )

            
            state.set('preferences:dark_mode', false)
            
            const cookies = new CookieService(_request, response)
            const token = cookies.get('Authorization', '') 
                || _request.headers['authorization'] as string
                || ''

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

            

            const ctx: Record<string, any> = {
                url,
                router,
                state: {},
                config: clientConfig.list(),
                logger: this.logger,
                cookies:  cookies.toObject(),
            }

            for (const [key, value] of state.entries()) {
                ctx.state[key] = value
            }

            const rendered = await render(ctx)

            let head = rendered.head ?? ''
            const body = rendered.html ?? ''

            // inject assets from assets facade
            head += this.getAssetsHtml()

            // only inject styles in development mode, to prevent layout shifts
            if (!isProduction) {
                head += '<link rel="stylesheet" href="/client/assets/styles.css">'
            }

            // state
            head += `<script>
                window.__INITIAL_STATE__ = ${JSON.stringify(ctx.state)}
                window.__CONFIG__ = ${JSON.stringify(clientConfig.list())}
            </script>`

            // Replace app-html first
            let html = template.replace('<!--app-html-->', body)
            
            // Add dark class to html tag if dark mode is enabled
            if (state.get('preferences:dark_mode')) {
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
    
    public async load(app: Application) {
        if (!isProduction) {
            const viteLogger = createLogger()

            const log: typeof viteLogger.info = (msg, opts) => {
                if (this.debug) {
                    this.logger.debug(msg, opts)
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

        if (isProduction) {
            app.use(express.static(basePath('client-dist', 'client')))
        }
    }
}

