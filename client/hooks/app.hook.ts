import { createSSRApp  } from 'vue'
import type { App as VueApp } from 'vue'
import type { Vue3TouchEventsOptions } from 'vue3-touch-events'
import Vue3TouchEvents from 'vue3-touch-events'
import App from '../App.vue'
import di from '../utils/di'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import { $t } from '#shared/lang.ts'


export default class AppLifecycleHook extends LifecycleHook {
    public order = 999
    public async onRegister(): Promise<void> {
        const app = createSSRApp(App)
        
        di.set('app', app)
    }
    
    public async onLoad(): Promise<void> {
        const app = di.get<VueApp>('app')

        app.config.globalProperties.$t = $t

        app.use<Vue3TouchEventsOptions>(Vue3TouchEvents, {
            disableClick: false,
        })
    }

    public async onBoot(): Promise<void> {
        const app = di.get<VueApp>('app')

        app.mount('#app')
    }
}
