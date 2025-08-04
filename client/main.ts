import { createSSRApp } from 'vue'
import './style.css'
import { $t } from '../shared/lang'
import App from './App.vue'
import { createRouter } from './router'
import type { ClientSetup } from './utils/defineClientSetup'
import { useMenu } from './composables/useMenu'
import { tryCatch } from '#shared/tryCatch.ts'

export async function createApp() {
    const app = createSSRApp(App)
    const menu = useMenu()
    const router = createRouter()

    app.use(router)
    app.config.globalProperties.$t = $t

    menu.clear()

    menu.add(
        {
            label: $t('Users'),
            icon: 'UsersIcon',
            children: [
                {
                    label: $t('List'),
                    to: '/admin/users',
                }
            ]
        },
        {
            label: $t('Advanced'),
            order: 900,
            group: true,
            items: [
                {
                    label: $t('Modules'),
                    to: '/admin/modules',
                    icon: 'PuzzleIcon',
                },
            ]
        }
    )

    const files = import.meta.glob<{ default: ClientSetup }>('./.runtime/**/*.setup.ts', { eager: true })

    for await (const [filename, mod] of Object.entries(files)) {
        const [error] = await tryCatch(() => mod.default.setup({
            router,
            menu 
        }))

        if (error) {
            console.error(`setup file error ${filename}:`, error)
            continue
        }

        console.debug('setup:', filename)
    }

    return {
        app,
        router 
    }
}
