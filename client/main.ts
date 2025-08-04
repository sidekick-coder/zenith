import { createSSRApp } from 'vue'
import './style.css'
import { $t } from '../shared/lang'
import App from './App.vue'
import { createRouter } from './router'
import type { ClientSetup } from './utils/defineClientSetup'
import { tryCatch } from '#shared/tryCatch.ts'

export async function createApp() {
    const app = createSSRApp(App)
    const router = createRouter()

    app.use(router)
    app.config.globalProperties.$t = $t

    const files = import.meta.glob<{ default: ClientSetup }>('./.runtime/**/*.setup.ts', { eager: true })

    for await (const [filename, mod] of Object.entries(files)) {
        console.debug('loading setup:', filename)

        const [error] = await tryCatch(() => mod.default.setup({ router }))

        if (error) {
            console.error(`Error in setup file ${filename}:`, error)
            continue
        }

        console.debug('setup loaded:', filename)
    }

    return {
        app,
        router 
    }
}
