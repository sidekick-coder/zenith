import fs from 'fs'
import di from '#server/facades/di.facade.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import modules from '#server/facades/modules.facade.ts'
import type Module from '#server/entities/module.entity.ts'
import ViteService from '#server/services/vite.service.ts'

export default class ModulesClientLifecycleHook extends LifecycleHook {
    public mods: (Module & LifecycleHook)[] = []

    public async onRegister(): Promise<void> {}

    public async onLoad(): Promise<void> {
        const vite = di.get<ViteService>(ViteService)

        const mods = [] as any[]

        for (const mod of modules.mods) {
            if (!mod.enabled) {
                continue
            }
            
            if (fs.existsSync(mod.makePath('client/module.client.ts'))) {
                mods.push(mod)
            }
        }
        
        vite.addToContainer('modules', mods)
    }

    public async onBoot(): Promise<void> {}
}