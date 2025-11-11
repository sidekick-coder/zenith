import { createSSRApp } from 'vue'
import { $t } from '../shared/lang'
import App from './App.vue'
import { createRouter } from './router'
import { useMenu } from './composables/useMenu'
import setup from './setup'
import { logger } from './utils/logger'
import config from './facades/config.facade'
import di from './utils/di'
import { $auth } from './composables/useAuth'
import { $acl } from './composables/useAcl'
import { listSetupFiles } from './utils/listSetupFiles'
import { tryCatch } from '#shared/utils/tryCatch.ts'

import './imports'

import './assets/styles.css'

if (import.meta.env.DEV) {
    await import('./assets/modules.css')
}

export async function createApp() {
    const app = createSSRApp(App)
    const menu = useMenu()
    const router = createRouter()

    const user = di.get<any>('auth:user', undefined)
    const permissions = di.get<any[]>('permissions', [])

    $auth.load({ user })
    $acl.load(permissions)

    app.config.globalProperties.$t = $t

    menu.clear()

    await setup.setup({
        router,
        menu 
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

    const hide = config.get<string>('menu.hide', '').split(',')
        .map((s: string) => s.trim())

    hide.forEach(id => menu.remove(id))
    
    const homeRoute = config.get('site.home_route_path', '/hello')
    
    const route = router.resolve(homeRoute)
    const record = route.matched[route.matched.length - 1]

    if (record) {
        router.addRoute({
            ...record,
            path: '/',
            name: 'home',
        })
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
