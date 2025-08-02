import type { DefineComponent } from 'vue'
import type { NavigationGuard, RouteRecordRaw } from 'vue-router'

interface Options {
    basePath?: string;
    imports: Record<string, DefineComponent | (() => Promise<DefineComponent>)>;
    filterParts?: string[];
    lowerCase?: boolean;
    guards?: NavigationGuard[];
    onRegister?: (record: RouteRecordRaw) => void;
}

export function autoRoutes(options: Options): RouteRecordRaw[] {
    const routes: RouteRecordRaw[] = []
    const basePath = options.basePath || '/'
    const filterParsts = options.filterParts || []
    const lowerCase = options.lowerCase !== undefined ? options.lowerCase : true

    for (const [filename, component] of Object.entries(options.imports)) {
        const parts = filename
            .replace(/\.vue$/, '')
            .split('/')
            .filter(part => part && !part.startsWith('.'))
            .filter(part => !filterParsts.includes(part))
            .map(part => {
                let p = lowerCase ? part.toLowerCase() : part
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

        if (!path.startsWith('/')) {
            path = '/' + path
        }

        if (path.endsWith('/')) {
            path = path.slice(0, -1)
        }

        path = basePath + path

        if (!path.startsWith('/')) {
            path = '/' + path
        }

        const record = {
            path: path,
            name: parts.join('-').replace(/:/g, ''),
            component: component as DefineComponent,
            beforeEnter: guards
        }

        if (options.onRegister) {
            options.onRegister(record)
        }

        routes.push(record)
    }

    return routes
}
