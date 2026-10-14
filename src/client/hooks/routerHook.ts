import type { App } from 'vue'
import { LifecycleHook } from '@sidekick-coder/zenith-kit/shared'
import { container, config, authGuard, guestGuard, setupGuard, auth } from '@sidekick-coder/zenith-kit/client'
import type { Router } from '@sidekick-coder/zenith-kit/client'
import { createRouter } from '#client/router.ts'

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
            guards: () => {
                if (auth.disabled === true) {
                    return []
                }

                return [authGuard]
            },
            refine: (records) => records.map(record => {
                record.meta = { layout: 'admin', }

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

        const homeRedirectPath = config.get('site.home_redirect_path', null)
        const homePath = config.get('site.home_path', '/hello')

        if (homeRedirectPath) {
            router.addRoute({
                path: '/',
                redirect: homeRedirectPath,
            })
        }

        if (homePath && !homeRedirectPath) {
            const route = router.resolve(homePath)
            const record = route.matched[route.matched.length - 1]

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
