import { createSSRApp } from 'vue'
import type { App as VueApp } from 'vue'
import di from '../utils/di'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import logger from '#client/facades/logger.facade.ts'
import Root from '#client/Root.vue'

export default class AppLifecycleHook extends LifecycleHook {
    public order = 999
    public async onRegister(): Promise<void> {
        const app = createSSRApp(Root)

        app.config.errorHandler = function (err, vm, info) {
            logger.error(info, err)
        }
        
        di.set('app', app)
    }
    
    public async onLoad(): Promise<void> {
        const app = di.get<VueApp>('app')

        app.config.globalProperties.$t = $t
        app.config.globalProperties.$dt = $dt
        app.config.globalProperties.$d = $d
        app.config.globalProperties.$translator = $translator
    }

    public async onShutdown(): Promise<void> {
        const app = di.get<VueApp>('app')

        app.unmount()
    }
}
