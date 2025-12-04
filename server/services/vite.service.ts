import fs from 'fs'
import type { Application } from 'express'
import { createLogger, createServer as createViteServer  } from 'vite'
import type { ViteDevServer } from 'vite'
import express from 'express'
import type { Request, Response } from 'express'
import env from '../env.ts'
import modules from './modules.service.ts'
import CookieService from './cookie.service.ts'
import config from '#server/facades/config.facade.ts'
import logger from '#server/facades/logger.facade.ts'
import { basePath, clientPath } from '#server/utils/paths.ts'
import router from '#server/facades/router.facade.ts'
import auth from '#server/facades/auth.facade.ts'
import assets from '#server/facades/assets.facade.ts'
import type User from '#server/entities/user.entity.ts'
import Permission from '#server/entities/permission.entity.ts'

const isProduction = env.NODE_ENV === 'production'



export default class ViteService {
    public logger = logger.child({ label: 'vite' })
    public server: ViteDevServer | undefined
    public debug = false

    public async render(url: string, _request: Request, response: Response) {
        try {
            const template = isProduction 
                ? fs.readFileSync(basePath('client-dist', 'client', 'client', 'index.html'), 'utf-8')
                : await this.server!.transformIndexHtml(url, fs.readFileSync(clientPath('index.html'), 'utf-8'))

            const render = isProduction
                ? (await import(basePath('client-dist', 'server', 'entry-server.js'))).render
                : (await this.server!.ssrLoadModule('/client/entry-server.ts')).render

                
            const state = {
                'auth:user': null as User | null,
                'config': env.CLIENT_CONFIG || {},
                'setup': config.get('setup') || {},
                'permissions': [] as Permission[],
                'modules:enabled': [] as string[],
                'client:setups:client': [] as string[],
                'client:setups:server': [] as string[],

                'user:metas': {} as Record<string, any>,
            }

            const mods = await modules.list({
                enabled: true
            })

            state['modules:enabled'] = mods.map(m => m.name)

            state['client:setups:client'] = mods
                .flatMap(m => m.files)
                .filter(f => f.type === 'setup:client' && f.context === 'client')
                .map(f => f.src)

            state['client:setups:server'] = mods
                .flatMap(m => m.files)
                .filter(f => f.type === 'setup:client' && f.context === 'server')
                .map(f => f.src)

            state.config.site = config.get('site', {})
            state.config.branding = config.get('branding', {})
            state.config.auth = config.get('auth', {})

            if (state.setup.user) {
                const token = 
                    new CookieService(_request, response).get('Authorization', '') 
                    || _request.headers['authorization'] as string
                    || ''
                
                state['auth:user'] = await auth.authenticate(token)
            }

            if (state['auth:user']) {
                const permissions = Permission.applyContext(state['auth:user'].permissions, {
                    auth: {
                        user: state['auth:user']
                    },
                })

                state['permissions'] = permissions
                state['user:metas'] = await state['auth:user'].$metas.all()
            }

            const log = (msg: string, opts?: any) => {
                if (this.debug) {
                    this.logger.debug(msg, opts)
                }
                
                return logger
            }

            const rendered = await render({
                url,
                router,
                state,
                logger: {
                    info: log,
                    warn: log,
                    error: log,
                    debug: log,
                },
                cookies:  new CookieService(_request, response).toObject(),
            })

            let head = rendered.head ?? ''
            const body = rendered.html ?? ''

            // inject assets from assets facade
            head += this.getAssetsHtml()

            // only inject styles in development mode, to prevent layout shifts
            if (!isProduction) {
                head += '<link rel="stylesheet" href="/client/assets/styles.css">'
            }

            // state
            head += `<script>window.__INITIAL_STATE__ = ${JSON.stringify(state)}</script>`

            // Replace app-html first
            let html = template.replace('<!--app-html-->', body)
            
            // Add dark class to html tag if dark mode is enabled
            if (state['user:metas']['admin-ui:dark_mode']) {
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

