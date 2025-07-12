import type { DefineComponent } from "vue";
import type { RouteRecordRaw } from "vue-router";

interface Options {
    basePath?: string;
    imports: Record<string, DefineComponent | (() => Promise<DefineComponent>)>;
    filterParts?: string[];
    lowerCase?: boolean;
}

export function autoRoutes(options: Options): RouteRecordRaw[] {
    const routes: RouteRecordRaw[] = [];
    const basePath = options.basePath || '/';
    const filterParsts = options.filterParts || [];
    const lowerCase = options.lowerCase !== undefined ? options.lowerCase : true;

    for (const [filename, component] of Object.entries(options.imports)) {
        let parts = filename.split('/')
            .filter(part => part && !part.startsWith('.'))
            .filter(part => !filterParsts.includes(part))
            .map(part => lowerCase ? part.toLowerCase() : part);

        let path = parts.join('/').replace(/\.vue$/, '').replace(/index$/, '')

        if (!path.startsWith('/')) {
            path = '/' + path;
        }

        path = basePath + path;

        if (!path.startsWith('/')) {
            path = '/' + path;
        }


        routes.push({
            path: path,
            component: component as DefineComponent,
        })
    }

    return routes
}
