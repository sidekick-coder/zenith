import { createSSRApp  } from 'vue'
import type { App as VueApp } from 'vue'
import type { Vue3TouchEventsOptions } from 'vue3-touch-events'
import Vue3TouchEvents from 'vue3-touch-events'
import App from '../App.vue'
import di from '../utils/di'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import { $t } from '#shared/lang.ts'
import { useMenu } from '#client/composables/useMenu.ts'
import { listSetupFiles } from '#client/utils/listSetupFiles.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import logger from '#client/facades/logger.facade.ts'

export default class AppLifecycleHook extends LifecycleHook {
    public order = 999
    public async onRegister(): Promise<void> {
        const app = createSSRApp(App)
        
        di.set('app', app)
    }
    
    public async onLoad(): Promise<void> {
        const menu = useMenu()
        const app = di.get<VueApp>('app')
        const router = di.get<any>('router')

        app.config.globalProperties.$t = $t

        app.use<Vue3TouchEventsOptions>(Vue3TouchEvents, {
            disableClick: false,
        })
        
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

    public async onBoot(): Promise<void> {
        const app = di.get<VueApp>('app')

        app.mount('#app')
    }
}
