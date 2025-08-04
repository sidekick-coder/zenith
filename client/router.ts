import {
    createRouter as createVueRouter,
    createMemoryHistory,
    createWebHistory
} from 'vue-router'
import type { NavigationGuard, Router as VueRouter } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import type { DefineComponent } from 'vue'
import setupGuard from './guards/setup.guard'

interface RouteModule {
    default: Array<RouteRecordRaw>
}

export interface Router extends VueRouter {
    auto: typeof auto;
}


interface AutoOptions {
    guards?: NavigationGuard[];
}

export function auto(imports: Record<string, DefineComponent | (() => Promise<DefineComponent>)>, options: AutoOptions = {}): RouteRecordRaw[] {
    const routes: RouteRecordRaw[] = []
    const basePath = '/'

    for (const [filename, component] of Object.entries(imports)) {
        const parts = filename
            .replace(/\.vue$/, '')
            .split('/')
            .filter(p => p && !p.startsWith('.'))
            .map(part => {
                let p = part

                if (p.startsWith('[') && p.endsWith(']')) {
                    p = ':' + p.slice(1, -1)
                }

                return p
            })

        let path = parts.join('/').replace(/index$/, '')

        const guards = [] as NavigationGuard[]
        
        if (options.guards) {
            guards.push(...options.guards)
        }       

        path = basePath + path

        if (!path.startsWith('/')) {
            path = '/' + path
        }

        if (path.endsWith('/')) {
            path = path.slice(0, -1)
        }

        const record = {
            path: path,
            name: parts.join('-').replace(/:/g, ''),
            component: component as DefineComponent,
            beforeEnter: guards
        }

        routes.push(record)
    }

    return routes
}

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
    }) as any as Router

    router.beforeEach(setupGuard)

    router.auto = (imports: Record<string, DefineComponent | (() => Promise<DefineComponent>)>, options: AutoOptions = {}) => {
        const autoRoutes = auto(imports, options)
        
        autoRoutes.forEach(route => router.addRoute(route))

        return autoRoutes
    }

    return router
}

