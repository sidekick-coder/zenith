import {
    createRouter as createVueRouter,
    createMemoryHistory,
    createWebHistory
} from 'vue-router'
import type { NavigationGuard, Router as VueRouter } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import type { DefineComponent } from 'vue'
import setupGuard from './guards/setup.guard'

export interface Router extends VueRouter {
    auto: typeof auto;
}


interface AutoOptions {
    guards?: NavigationGuard[] | ((record: RouteRecordRaw) => NavigationGuard[]);
    strip?: (string | RegExp)[];
    refine?: (records: RouteRecordRaw[]) => RouteRecordRaw[];
}

export function auto(imports: Record<string, DefineComponent | (() => Promise<DefineComponent>)>, options: AutoOptions = {}): RouteRecordRaw[] {
    let routes: RouteRecordRaw[] = []
    const basePath = '/'

    for (const [filename, component] of Object.entries(imports)) {
        let parts = filename
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

        // Strip specific segments
        if (options.strip?.length) {
            parts = parts.filter(p =>
                !options.strip!.some(rule =>
                    typeof rule === 'string'
                        ? p === rule
                        : rule.test(p)
                )
            )
        }

        let path = parts.join('/').replace(/index$/, '')

        

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
            beforeEnter: [] as NavigationGuard[],
        }

        const guards = [] as NavigationGuard[]
        
        if (options.guards && Array.isArray(options.guards)) {
            guards.push(...options.guards)
        }

        if (options.guards && typeof options.guards === 'function') {
            record.beforeEnter = options.guards(record)
        }

        routes.push(record)
    }

    if (options.refine) {
        routes = options.refine(routes)
    }

    return routes
}

export function createRouter() {
    const ssr = import.meta.env.SSR

    const router = createVueRouter({
        history: ssr ? createMemoryHistory() : createWebHistory(),
        routes: [],
    }) as any as Router

    router.beforeEach(setupGuard)

    router.auto = (imports: Record<string, DefineComponent | (() => Promise<DefineComponent>)>, options: AutoOptions = {}) => {
        const autoRoutes = auto(imports, options)
        
        autoRoutes.forEach(route => router.addRoute(route))

        return autoRoutes
    }

    return router
}

