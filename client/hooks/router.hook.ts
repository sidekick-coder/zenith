import type { App, DefineComponent } from 'vue'
import di from '../utils/di'
import { createRouter } from '#client/router'
import type { Router } from '#client/router'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import guestGuard from '#client/guards/guest.guard.ts'
import authGuard from '#client/guards/auth.guard.ts'
import setupGuard from '#client/guards/setup.guard.ts'
import config from '#client/facades/config.facade.ts'

export default class RouterLifecycleHook extends LifecycleHook {
    public async onRegister(): Promise<void> {
        const router = createRouter()

        di.set('router', router)
    }

    public async onLoad(): Promise<void> {
        const router = di.get<Router>('router')

        router.beforeEach(setupGuard)

        router.auto(import.meta.glob<DefineComponent>('../pages/**/*.vue',), {
            strip: ['pages'],
            guards: record => {
                    
                if (record.path === '/admin/auth/login') {
                    return [guestGuard]
                }
        
                if (record.path.startsWith('/admin')) {
                    return [authGuard]
                }
        
                return []
            }
        })
        
        router.addRoute({
            path: '/admin',
            redirect: '/admin/users',
        })
        
        router.addRoute({
            path: '/admin/settings',
            redirect: '/admin/settings/auth',
        })

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
    }

    public async onBoot(): Promise<void> {
        const router = di.get<Router>('router')
        const app = di.get<App>('app')

        router.addRoute({
            path: '/:pathMatch(.*)*',
            component: () => import('../pages/errors/404.vue'),
        })

        app.use(router)
    }
}
