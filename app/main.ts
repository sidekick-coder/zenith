import { createSSRApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createRouter } from './router'
import { $t } from '../common/lang'
import di from './utils/di'

export function createApp() {
    const app = createSSRApp(App)
    const router = createRouter()

    app.use(router)
    app.config.globalProperties.$t = $t

    return {
        app,
        router 
    }
}
