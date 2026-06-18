import type { App } from 'vue'
import { LifecycleHook } from '@sidekick-coder/zenith-kit/shared'
import { container, config, authGuard, guestGuard, setupGuard  } from '@sidekick-coder/zenith-kit/client'
import type { Router } from '@sidekick-coder/zenith-kit/client'
import { createRouter } from '#client/router'

export default class extends LifecycleHook {
    public hook_aliases = ['router']
    public order = 10

    public async onRegister(): Promise<void> {
        const router = createRouter()

        container.set('router', router)
    }

    public async onLoad(): Promise<void> {
        const router = container.get<Router>('router')

        container.set('route', router.currentRoute)

        router.beforeEach(setupGuard)

        router.beforeEach(async (to) => {
            container.set('route', to)

            return true
        })

        router.auto(import.meta.glob<any>('../pages/admin/**/*.vue',), {
            strip: ['pages'],
            guards: [authGuard],
            refine: (records) => records.map(record => {
                const layoutedPages = ['/admin/users', '/admin/users/:id', '/admin/roles']

                if (layoutedPages.includes(record.path)) {
                    record.meta = { layout: 'admin', }
                }

                return record
            })

        })

        router.auto(import.meta.glob<any>('../pages/auth/**/*.vue',), {
            strip: ['pages'],
            guards: [guestGuard],
        })

        router.auto(import.meta.glob<any>('../pages/**/*.vue',), {
            strip: ['pages'],
            exclude: ['/admin', '/auth'],
        })

        router.addRoute({
            path: '/admin',
            redirect: '/admin/users',
        })

        router.addRoute({
            path: '/admin/settings',
            redirect: '/admin/settings/auth/layout',
        })


    }

    public async boot(): Promise<void> {
        const router = container.get<Router>('router')
        const app = container.get<App>('app')

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

        router.addRoute({
            path: '/:pathMatch(.*)*',
            component: () => import('../pages/errors/404.vue'),
        })

        app.use(router as any)
    }
}
