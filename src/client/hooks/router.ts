import type { App } from 'vue'
import { LifecycleHook } from '@sidekick-coder/zenith-kit/shared'
import { container, config, authGuard, guestGuard, setupGuard, auth, RouterService, emmitter } from '@sidekick-coder/zenith-kit/client'

export default class extends LifecycleHook {
    public hook_aliases = ['router']
    public order = 10

    public async register(): Promise<void> {
        const router = new RouterService({ ssr: import.meta.env.SSR, })

        container.set(RouterService, router)

        await emmitter.emitAndWait('router:registered', { router })
    }

    public async load(): Promise<void> {
        const router = container.get<RouterService>(RouterService)

        container.set('route', router.vueRouter.currentRoute)

        router.vueRouter.beforeEach(setupGuard)

        router.vueRouter.beforeEach(async (to) => {
            container.set('route', to)

            return true
        })

        router.addSource({
            files: import.meta.glob<any>('../pages/admin/**/*.vue',),
            strip: ['pages'],
            layout: 'admin',
            guards: auth.disabled === true ? [] : [authGuard],
        })

        router.addSource({
            files: import.meta.glob<any>('../pages/auth/**/*.vue',),
            strip: ['pages'],
            guards: [guestGuard],
        })


        router.addSource({
            files: import.meta.glob<any>('../pages/**/*.vue',),
            strip: ['pages'],
            exclude: ['/admin', '/auth'],
        })

        router.vueRouter.addRoute({
            path: '/admin',
            redirect: '/admin/users',
        })

        router.vueRouter.addRoute({
            path: '/admin/settings',
            redirect: '/admin/settings/auth/layout',
        })
    }

    public async boot(): Promise<void> {
        const router = container.get<RouterService>(RouterService)
        const app = container.get<App>('app')

        const homeRedirectPath = config.get('site.home_redirect_path', null)
        const homePath = config.get('site.home_path', '/hello')

        if (homeRedirectPath) {
            router.vueRouter.addRoute({
                path: '/',
                redirect: homeRedirectPath,
            })
        }

        if (homePath && !homeRedirectPath) {
            const route = router.vueRouter.resolve(homePath)
            const record = route.matched[route.matched.length - 1]

            router.vueRouter.addRoute({
                ...record,
                path: '/',
                name: 'home',
            })
        }


        router.vueRouter.addRoute({
            path: '/:pathMatch(.*)*',
            component: () => import('../pages/errors/404.vue'),
        })

        app.use(router.vueRouter)
    }
}
