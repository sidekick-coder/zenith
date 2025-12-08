import path from 'path'
import fs from 'fs'
import di from '#server/facades/di.facade.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import RouterSevice from '#server/services/router.service.ts'
import RouterRegister from '#server/services/routerRegister.service.ts'
import type { RouterRegisterEntry } from '#server/services/routerRegister.service.ts'
import { basePath  } from '#server/utils/index.ts'
import type { SetupServerParams } from '#server/utils/index.ts'
import config from '#server/facades/config.facade.ts'
import modules from '#server/facades/modules.facade.ts'
import type Module from '#server/entities/module.entity.ts'
import ViteService from '#server/services/vite.service.ts'
import type { ViteServiceEvents } from '#server/services/vite.service.ts'
import env from '#server/facades/env.facade.ts'

export default class ModulesLifecycleHook extends LifecycleHook {
    public async onRegister(): Promise<void> {
        await modules.discover()

        await modules.loadModulesInstances()

        for (const mod of modules.mods) {
            if (typeof mod.onRegister === 'function') {
                await mod.onRegister()
            }
        }
    }

    public async onLoad(): Promise<void> {
        const router = di.get<RouterRegister>(RouterSevice)
        const vite = di.get<ViteService>(ViteService)

        const assets = [] as any[]

        for (const mod of modules.mods) {
            // Load module routes
            const hook = (entry: RouterRegisterEntry) => {
                entry.metadata.module = mod.id
            }

            router.on('addEntry', hook)

            if (typeof mod.onLoad === 'function') {
                await mod.onLoad()
            }

            router.off('addEntry', hook)

            // load assets if have
            if (env.production && fs.existsSync(mod.makePath('client-dist/browser/styles.css'))) {
                assets.push(`static/modules/${mod.id}/browser/styles.css`)
            }
        }

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

    public async onBoot(): Promise<void> {
        for (const mod of modules.mods) {
            if (typeof mod.onBoot === 'function') {
                await mod.onBoot()
            }
        }
    }
}