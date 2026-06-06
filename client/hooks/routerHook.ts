import type { App, DefineComponent } from 'vue'
import { LifecycleHook } from '@sidekick-coder/zenith-kit/shared'
import { container } from '@sidekick-coder/zenith-kit/client'
import { createRouter } from '#client/router'
import type { Router } from '#client/router'
import guestGuard from '#client/guards/guest.guard.ts'
import authGuard from '#client/guards/auth.guard.ts'
import setupGuard from '#client/guards/setup.guard.ts'
import config from '#client/facades/config.facade.ts'

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

        router.auto(import.meta.glob<DefineComponent>('../pages/admin/**/*.vue',), {
            strip: ['pages'],
            guards: [authGuard]
        })

        router.auto(import.meta.glob<DefineComponent>('../pages/auth/**/*.vue',), {
            strip: ['pages'],
            guards: [guestGuard],
        })

        router.auto(import.meta.glob<DefineComponent>('../pages/**/*.vue',), {
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

        app.use(router)
    }
}
