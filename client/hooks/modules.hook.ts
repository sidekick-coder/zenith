import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import { useMenu } from '#client/composables/useMenu.ts'
import { listSetupFiles } from '#client/utils/listSetupFiles.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import logger from '#client/facades/logger.facade.ts'
import di from '#client/utils/di'

export default class ModulesLifecycleHook extends LifecycleHook {
    public order = 998
    
    public async onLoad(): Promise<void> {
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
