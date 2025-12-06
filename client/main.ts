import { createSSRApp } from 'vue'
import Vue3TouchEvents from 'vue3-touch-events'
import type { Vue3TouchEventsOptions } from 'vue3-touch-events'
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

export async function createApp() {
    const app = createSSRApp(App)
    const menu = useMenu()
    const router = createRouter()

    // plugins 
    app.use<Vue3TouchEventsOptions>(Vue3TouchEvents, {
        disableClick: false,
    })

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
    
    // also remove menu items the user has chosen to hide via user meta
    const metas = di.get<Record<string, any>>('user:metas', {})

    // menu.removeMany(metas['admin-ui:hide-menus'] || [])
    // menu.removeManyGroup(metas['admin-ui:hide-menu-groups'] || [])
    
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
