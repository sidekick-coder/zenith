// router.js
import {
    createRouter as createVueRouter,
    createMemoryHistory,
    createWebHistory
    
} from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import setupGuard from './guards/setup.guard'

interface RouteModule {
    default: Array<RouteRecordRaw>
}

export type Router = ReturnType<typeof createRouter>

export function createRouter() {
    const ssr = import.meta.env.SSR

    const files = import.meta.glob<RouteModule>('./routes/**/*.ts', { eager: true })

    const routes = Object.values(files).map(f => f.default || f).flat()

    routes.push({
        path: '/:pathMatch(.*)*',
        component: () => import('./pages/Errors/404.vue'),
    })

    const router = createVueRouter({
        history: ssr ? createMemoryHistory() : createWebHistory(),
        routes,
    })

    router.beforeEach(setupGuard)

    return router
}

