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

        const clientFiles = [] as string[]

        for (const mod of modules.mods) {
            if (fs.existsSync(mod.makePath('client/module.client.ts'))) {
                clientFiles.push(mod.staticPath('client/module.client.ts'))
            }
        }
        
        vite.addState('modules:constructors', clientFiles)
    }

    public async onBoot(): Promise<void> {}
}