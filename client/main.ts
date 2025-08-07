import { createSSRApp } from 'vue'
import './style.css'
import { $t } from '../shared/lang'
import App from './App.vue'
import { createRouter } from './router'
import type { ClientSetup } from './utils/defineClientSetup'
import { useMenu } from './composables/useMenu'
import setup from './setup'
import { logger } from './utils/logger'
import { tryCatch } from '#shared/tryCatch.ts'

export async function createApp() {
    const app = createSSRApp(App)
    const menu = useMenu()
    const router = createRouter()

    app.config.globalProperties.$t = $t

    menu.clear()

    setup.setup({
        router,
        menu 
    })    

    const files = import.meta.glob<{ default: ClientSetup }>('./.runtime/**/*.setup.ts', { eager: true })

    for await (const [filename, mod] of Object.entries(files)) {
        const [error] = await tryCatch(() => mod.default.setup({
            router,
            menu 
        }))

        if (error) {
            logger.error(`setup file error ${filename}:`)
            continue
        }

        logger.debug(`setup file loaded: ${filename}`)
    }   

    // add error 404
    router.addRoute({
        path: '/:pathMatch(.*)*',
        component: () => import('./pages/errors/404.vue'),
    })

    app.use(router)

    return {
        app,
        router 
    }
}
