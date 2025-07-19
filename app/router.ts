// router.js
import {
    createRouter as createVueRouter,
    createMemoryHistory,
    createWebHistory,
    type RouteRecordRaw
} from 'vue-router'

interface RouteModule {
    default: Array<RouteRecordRaw>
}

export function createRouter() {
    const ssr = import.meta.env.SSR

    const files = import.meta.glob<RouteModule>('./routes/**/*.ts', { eager: true })

    const routes = Object.values(files).map(f => f.default || f).flat()

    routes.push({
        path: '/:pathMatch(.*)*',
        component: () => import('./pages/Errors/404.vue'),
    })

    return createVueRouter({
        history: ssr ? createMemoryHistory() : createWebHistory(),
        routes,
    })
}

