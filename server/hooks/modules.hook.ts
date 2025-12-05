import path from 'path'
import fs from 'fs'
import di from '#server/facades/di.facade.ts'
import { LifecycleHook } from '#server/services/lifecycle.service.ts'
import RouterSevice from '#server/services/router.service.ts'
import RouterRegister from '#server/services/routerRegister.service.ts'
import type { RouterRegisterEntry } from '#server/services/routerRegister.service.ts'
import { basePath  } from '#server/utils/index.ts'
import type { SetupServerParams } from '#server/utils/index.ts'
import config from '#server/facades/config.facade.ts'
import modules from '#server/facades/modules.facade.ts'
import type Module from '#server/entities/module.entity.ts'

export default class ModulesLifecycleHook extends LifecycleHook {
    public id = 'modules'
    public mods: (Module & LifecycleHook)[] = []

    public async onRegister(): Promise<void> {
        await modules.discover()

        for (const manifest of modules.manifests.values()) {
            if (!manifest.enabled) {
                continue
            }
        
            const file = path.join(basePath('modules'), manifest.id, 'server/module.server.ts')
        
            if (!await fs.promises.stat(file).catch(() => false)) {
                continue
            }

            const modImport = await import(file)
            const ModClass = modImport.default || modImport

            const modInstance = new ModClass() as any

            Object.assign(modInstance, manifest)

            this.mods.push(modInstance)
        }

        for (const mod of this.mods) {
            if (typeof mod.onRegister === 'function') {
                await mod.onRegister()
            }
        }
    }

    public async onLoad(): Promise<void> {
        const router = di.get<RouterRegister>(RouterSevice)

        for (const mod of this.mods) {

            const hook = (entry: RouterRegisterEntry) => {
                entry.metadata.module = mod.id
            }

            router.on('addEntry', hook)

            if (typeof mod.onLoad === 'function') {
                await mod.onLoad()
            }

            router.off('addEntry', hook)
        }
    }

    public async onBoot(): Promise<void> {
        for (const mod of this.mods) {
            if (typeof mod.onBoot === 'function') {
                await mod.onBoot()
            }
        }
    }
}