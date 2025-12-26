import fs from 'fs'
import path from 'path'
import di from '#server/facades/di.facade.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import RouterSevice from '#server/services/router.service.ts'
import RouterRegister from '#server/services/routerRegister.service.ts'
import type { RouterRegisterEntry } from '#server/services/routerRegister.service.ts'
import modules from '#server/facades/modules.facade.ts'
import config from '#server/facades/config.facade.ts'
import { importAll } from '#server/utils/importAll.ts'

export default class ModulesLifecycleHook extends LifecycleHook {
    public order = 3
    public hooks: Map<string, LifecycleHook> = new Map()
    
    public async onRegister(): Promise<void> {

        modules.init({
            debug: config.getOne(['modules.debug', 'app.debug'], false),
        })

        await modules.discover()

        await modules.loadModulesInstances()

        for (const mod of modules.mods) {
            this.hooks.set(mod.hook_id, mod)

            if (fs.existsSync(mod.makePath('server/hooks'))) {
                const files = await importAll(mod.makePath('server/hooks'))

                for (const [filename, file] of Object.entries(files)) {
                    const HookClass = file.default || file

                    if (!HookClass) {
                        modules.logger.warn(`No default export found in module ${mod.id} hook file, skipping`)
                        continue
                    }

                    const instance = new HookClass()

                    if (!(instance instanceof LifecycleHook)) {
                        modules.logger.warn(`Invalid hook class in module ${mod.id}, skipping`)
                        continue
                    }

                    let name = instance.constructor.name

                    if (name === 'default') {
                        name = path.basename(filename, path.extname(filename))
                    }

                    instance.hook_id = `module:${mod.id}:${name}`

                    this.hooks.set(instance.hook_id, instance)
                }
            }
        }

        for await (const hook of this.hooks.values()) {
            await hook.onRegister()
        }
    }

    public async onLoad(): Promise<void> {
        const router = di.get<RouterRegister>(RouterSevice)

        for (const hook of this.hooks.values()) {
            // Load module routes
            const listener = (entry: RouterRegisterEntry) => {
                entry.metadata.module = hook.hook_id.split(':')[0]
            }

            router.on('addEntry', listener)

            if (typeof hook.onLoad === 'function') {
                await hook.onLoad()
            }

            router.off('addEntry', listener)
        }
    }

    public async onBoot(): Promise<void> {
        for (const hook of this.hooks.values()) {
            await hook.onBoot()
        }
    }

    public async onShutdown(): Promise<void> {
        for (const hook of this.hooks.values()) {
            await hook.onShutdown()
        }
    }
}