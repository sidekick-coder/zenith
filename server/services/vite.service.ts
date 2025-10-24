import fs from 'fs'
import type { Application } from 'express'
import { createServer as createViteServer  } from 'vite'
import type { ViteDevServer } from 'vite'
import express from 'express'
import type { Request, Response } from 'express'
import env from '../env.ts'
import modules from './modules.service.ts'
import config from '#server/facades/config.facade.ts'
import rootLogger from '#server/facades/logger.facade.ts'
import { clientPath, storagePath } from '#server/utils/paths.ts'
import router from '#server/facades/router.facade.ts'
import auth from '#server/facades/auth.facade.ts'
import assets from '#server/facades/assets.facade.ts'
import type User from '#server/entities/user.entity.ts'
import Permission from '#server/entities/permission.entity.ts'

const isProduction = env.NODE_ENV === 'production'

const logger = rootLogger.child({ label: 'vite.service' })

export class ViteServer {
    private vite: ViteDevServer | undefined

    public async render(url: string, _request: Request, response: Response) {
        try {
            const template = isProduction 
                ? fs.readFileSync(storagePath('dist', 'client', 'client', 'index.html'), 'utf-8')
                : await this.vite!.transformIndexHtml(url, fs.readFileSync(clientPath('index.html'), 'utf-8'))

            const render = isProduction
                ? (await import(storagePath('dist', 'server', 'entry-server.js'))).render
                : (await this.vite!.ssrLoadModule('/client/entry-server.ts')).render

                
            const state = {
                'auth:user': null as User | null,
                'config': env.CLIENT_CONFIG || {},
                'setup': config.get('setup') || {},
                'permissions': [] as Permission[],
                'modules:enabled': [] as string[],
                'client:setups:client': [] as string[],
                'client:setups:server': [] as string[],
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

            if (state.setup.user) {
                state['auth:user'] = await auth.authenticate(_request.cookies['Authorization'] || '')
            }

            if (state['auth:user']) {
                const permissions = Permission.applyContext(state['auth:user'].permissions, {
                    auth: {
                        user: state['auth:user']
                    },
                })

                state['permissions'] = permissions
            }

            const rendered = await render({
                url,
                router,
                state,
                logger,
                cookies: _request.cookies || {},
            })

            let head = rendered.head ?? ''
            const body = rendered.html ?? ''

            // inject assets from assets facade
            const assetStyles = this.getAssetsHtml()
            head += assetStyles

            // only inject styles in development mode
            if (!isProduction) {
                head += '<link rel="stylesheet" href="/client/style.css">'
            }

            // state
            head += `<script>window.__INITIAL_STATE__ = ${JSON.stringify(state)}</script>`

            const html = template
                .replace('<!--app-head-->', head)
                .replace('<!--app-html-->', body)

            response.status(200).set({ 'Content-Type': 'text/html' })
                .end(html)
        } catch (e) {
            logger.error('Error during Vite SSR render', {
                error: e,
                label: 'vite' 
            })
            const error = e as Error
            this.vite?.ssrFixStacktrace(error)
            console.log(error.stack)
            response.status(500).end(error.stack)
        }
    }

    private getAssetsHtml(): string {
        let html = ''
        
        // Get all assets from the assets service
        const allAssets = assets.getAll()
        
        for (const [name, asset] of Object.entries(allAssets)) {
            if (asset.src) {
                html += `<link rel="stylesheet" href="${asset.src}">`
            }
            
            if (asset.content) {
                html += `<style data-asset="${name}">${asset.content}</style>`
            }
        }
        
        return html
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
            app.use(express.static(storagePath('dist', 'client')))
        }
    }
}

const vite = new ViteServer()

export default vite

