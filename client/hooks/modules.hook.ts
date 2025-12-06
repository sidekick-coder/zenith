import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import { useMenu } from '#client/composables/useMenu.ts'
import { listSetupFiles } from '#client/utils/listSetupFiles.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import logger from '#client/facades/logger.facade.ts'
import di from '#client/utils/di'
import type ModuleManifest from '#shared/entities/moduleManifest.entity.ts'
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
            const [error] = await tryCatch(async () => {
                if (typeof mod.onLoad === 'function') {
                    await mod.onLoad()
                }
            })

            if (error) {
                modules.logger.error(`Error loading module ${mod.id}:`, error)
            }

            if (modules.debug) {
                modules.logger.debug(`module load ${mod.id}`)
            }
        }

        const menu = useMenu()
        const router = di.get<any>('router')

        const files = await listSetupFiles()
        
        for await (const [filename, mod] of Object.entries(files)) {
            const [error] = await tryCatch(() => mod.default.setup({
                router,
                menu 
            }))
        
            if (error) {
                logger.error(`setup file error ${filename}:`, error)
                continue
            }
        
            logger.debug(`setup file loaded: ${filename}`)
        }
    }
}
