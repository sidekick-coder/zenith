import { createSSRApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createRouter } from './router'
import { $t } from './utils/lang'
import di from './utils/di'

export function createApp() {
    const app = createSSRApp(App)
    const router = createRouter()

    app.use(router)
    app.config.globalProperties.$t = $t

    router.beforeEach((to, _from) => {
        const user = di.get<any>('auth:user')

        if (!user && to.path !== '/admin/auth/login') {
            return '/admin/auth/login'
        }

        if (user && to.path === '/admin/auth/login') {
            console.log(`User ${user.email} is authenticated`)

            return '/admin'
        }
    })

    return {
        app,
        router 
    }
}
