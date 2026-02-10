import { createSSRApp  } from 'vue'
import type { App as VueApp } from 'vue'
import type { Vue3TouchEventsOptions } from 'vue3-touch-events'
import Vue3TouchEvents from 'vue3-touch-events'
import App from '../App.vue'
import di from '../utils/di'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import logger from '#client/facades/logger.facade.ts'

export default class AppLifecycleHook extends LifecycleHook {
    public order = 999
    public async onRegister(): Promise<void> {
        const app = createSSRApp(App)

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

        app.use<Vue3TouchEventsOptions>(Vue3TouchEvents, {
            disableClick: false,
        })
    }

    public async onShutdown(): Promise<void> {
        const app = di.get<VueApp>('app')

        app.unmount()
    }
}
