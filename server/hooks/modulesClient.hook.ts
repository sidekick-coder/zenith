import fs from 'fs'
import di from '#server/facades/di.facade.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import modules from '#server/facades/modules.facade.ts'
import type Module from '#server/entities/module.entity.ts'
import ViteService from '#server/services/vite.service.ts'
import type { ViteServiceEvents } from '#server/services/vite.service.ts'
import env from '#server/facades/env.facade.ts'

export default class ModulesClientLifecycleHook extends LifecycleHook {
    public order = 3
    public mods: (Module & LifecycleHook)[] = []

    public async onRegister(): Promise<void> {}

    public async onLoad(): Promise<void> {
        const vite = di.get<ViteService>(ViteService)

        const mods = [] as any[]
        const assets = [] as any[]

        for (const mod of modules.mods) {
            if (!mod.enabled) {
                continue
            }
            
            if (fs.existsSync(mod.makePath('client/module.client.ts'))) {
                mods.push(mod)
            }

            // load assets if have
            if (env.production && fs.existsSync(mod.makePath('client-dist/browser/styles.css'))) {
                assets.push(`static/modules/${mod.id}/browser/styles.css`)
            }
        }
        
        vite.addDependency('modules', mods)

        vite.on('vite:render', ({ head }: ViteServiceEvents['vite:render']) => {
            assets.forEach(asset => {
                if (asset.endsWith('.css')) {
                    head
                        .child('link')
                        .attr('type', 'text/css')
                        .attr('rel', 'stylesheet')
                        .attr('href', `/${asset}`)
                }
            })
        })
    }

    public async onBoot(): Promise<void> {}
}