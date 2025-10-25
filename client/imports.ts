import * as Vue from 'vue'
import * as rekaUI from 'reka-ui'
import * as vueRouter from 'vue-router'
import * as veeValidate from 'vee-validate'

globalThis.imports = {
    'vue': Vue,
    'reka-ui': rekaUI,
    'vue-router': vueRouter,
    'vee-validate': veeValidate,
}

// Handle #client and #shared imports
for (const [path, mod] of Object.entries(import.meta.glob('./{utils,components}/**/*.ts', { eager: true }))) {
    const id = path.replace('./', '#client/')

    globalThis.imports[id] = mod
    globalThis.imports[id.replace('.ts', '')] = mod

    if (path.endsWith('index.ts')) {
        const indexId = id.replace('/index.ts', '')

        globalThis.imports[indexId] = mod
    }
}

for (const [path, importFn] of Object.entries(import.meta.glob<any>('./{components,layouts}/**/*.vue'))) {
    const id = path.replace('./', '#client/')

    const lazyImport = Vue.defineAsyncComponent(async () => {
        const mod = await importFn()

        return mod.default || mod
    })

    const ext = path.split('.').pop()

    globalThis.imports[id] = lazyImport
    globalThis.imports[id.replace(`.${ext}`, '')] = lazyImport
}

for (const [path, mod] of Object.entries(import.meta.glob('./../shared/**', { eager: true }))) {
    const id = path.replace('../shared/', '#shared/')

    globalThis.imports[id] = mod
    globalThis.imports[id.replace('.ts', '')] = mod
}