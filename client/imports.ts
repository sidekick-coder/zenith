import * as Vue from 'vue'
import * as VueServerRenderer from 'vue/server-renderer'
import * as rekaUI from 'reka-ui'
import * as vueRouter from 'vue-router'
import * as veeValidate from 'vee-validate'

const all = {} as Record<string, any>

globalThis.imports = {
    'vue': Vue,
    'vue/server-renderer': VueServerRenderer,
    'reka-ui': rekaUI,
    'vue-router': vueRouter,
    'vee-validate': veeValidate,
}

all['vue'] = () => import('vue')
all['vue/server-renderer'] = () => import('vue/server-renderer')
all['reka-ui'] = () => import('reka-ui')
all['vue-router'] = () => import('vue-router')
all['vee-validate'] = () => import('vee-validate')

// Handle #client and #shared imports
for (const [path, mod] of Object.entries(import.meta.glob('./{utils,guards,facades,composables,components}/**/*.ts', { eager: true }))) {
    const id = path.replace('./', '#client/')

    globalThis.imports[id] = mod
    globalThis.imports[id.replace('.ts', '')] = mod

    all[id] = () => Promise.resolve(mod)
    all[id.replace('.ts', '')] = () => Promise.resolve(mod)

    if (path.endsWith('index.ts')) {
        const indexId = id.replace('/index.ts', '')

        globalThis.imports[indexId] = mod
        all[indexId] = () => Promise.resolve(mod)
    }
}

for (const [path, importFn] of Object.entries(import.meta.glob<any>('./{components,layouts}/**/*.vue'))) {
    const id = path.replace('./', '#client/')

    const lazyImport = Vue.defineAsyncComponent(async () => importFn())

    const ext = path.split('.').pop()

    globalThis.imports[id] = lazyImport
    globalThis.imports[id.replace(`.${ext}`, '')] = lazyImport

    all[id] = importFn
    all[id.replace(`.${ext}`, '')] = importFn
}

for (const [path, mod] of Object.entries(import.meta.glob('./../shared/**', { eager: true }))) {
    const id = path.replace('../shared/', '#shared/')

    globalThis.imports[id] = mod
    globalThis.imports[id.replace('.ts', '')] = mod
    all[id] = () => Promise.resolve(mod)
    all[id.replace('.ts', '')] = () => Promise.resolve(mod)
}



globalThis.importAsync = async (id: string): Promise<any> => {
    const importFn = all[id]
    
    if (!importFn) {
        throw new Error(`Module not found: ${id}`)
    }

    return importFn()
}

console.log(globalThis.imports)