import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import modules from '#client/facades/modules.facade.ts'

export default class ModulesLifecycleHook extends LifecycleHook {
    public order = 998

    public async onRegister(): Promise<void> {
        await modules.discover()
        
        for await (const mod of modules.mods) {
            const [error] = await tryCatch(() =>  mod.onRegister())
            
            if (error) {
                modules.logger.error(`Error loading module ${mod.id}:`, error)
            }

            
            if (modules.debug) {
                modules.logger.debug(`module register ${mod.id}`)
            }
        }
    }
    
    public async onLoad(): Promise<void> {

        for await (const mod of modules.mods) {
            const [error] = await tryCatch(async () => await mod.onLoad())

            if (error) {
                modules.logger.error(`Error loading module ${mod.id}:`, error)
            }

            if (modules.debug) {
                modules.logger.debug(`module load ${mod.id}`)
            }
        }
    }

    public async onBoot(): Promise<void> {
        for await (const mod of modules.mods) {
            const [error] = await tryCatch(async () => await mod.onBoot())

            if (error) {
                modules.logger.error(`Error booting module ${mod.id}:`, error)
            }

            if (modules.debug) {
                modules.logger.debug(`module boot ${mod.id}`)
            }
        }
    }

    public async onShutdown(): Promise<void> {
        for await (const mod of modules.mods) {
            const [error] = await tryCatch(async () => await mod.onShutdown())

            if (error) {
                modules.logger.error(`Error shutting down module ${mod.id}:`, error)
            }

            if (modules.debug) {
                modules.logger.debug(`module shutdown ${mod.id}`)
            }
        }
    }
}
