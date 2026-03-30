import 'iconify-icon'

import * as Vue from 'vue'
import * as RekaUI from 'reka-ui'
import * as VueRouter from 'vue-router'
import * as VeeValidate from 'vee-validate'
import * as VueSonner from 'vue-sonner' 
import * as VueUse from '@vueuse/core' 
import * as UnheadVue from '@unhead/vue' 
import * as UnheadVueComponents from '@unhead/vue/components'

globalThis.imports = globalThis.imports || {}

globalThis.imports['vue'] = () => Promise.resolve(Vue)
globalThis.imports['reka-ui'] = () => Promise.resolve(RekaUI)
globalThis.imports['vue-router'] = () => Promise.resolve(VueRouter)
globalThis.imports['vee-validate'] = () => Promise.resolve(VeeValidate)
globalThis.imports['vue-sonner'] = () => Promise.resolve(VueSonner)
globalThis.imports['@vueuse/core'] = () => Promise.resolve(VueUse)
globalThis.imports['@unhead/vue'] = () => Promise.resolve(UnheadVue)
globalThis.imports['@unhead/vue/components'] = () => Promise.resolve(UnheadVueComponents)


// Handle #client and #shared imports
for (const [path, mod] of Object.entries(import.meta.glob('./{utils,entities,guards,facades,composables,components}/**/*.ts', { eager: true }))) {
    const id = path.replace('./', '#client/')

    globalThis.imports[id] = () => Promise.resolve(mod)
    globalThis.imports[id.replace('.ts', '')] = () => Promise.resolve(mod)

    if (path.endsWith('index.ts')) {
        const indexId = id.replace('/index.ts', '')

        globalThis.imports[indexId] = () => Promise.resolve(mod)
    }
}

for (const [path, importFn] of Object.entries(import.meta.glob<any>('./{components,layouts}/**/*.vue'))) {
    const id = path.replace('./', '#client/')

    const ext = path.split('.').pop()

    globalThis.imports[id] = importFn
    globalThis.imports[id.replace(`.${ext}`, '')] = importFn
}

for (const [path, mod] of Object.entries(import.meta.glob('./../shared/**'))) {
    const id = path.replace('../shared/', '#shared/')

    globalThis.imports[id] = mod
    globalThis.imports[id.replace('.ts', '')] = mod
}

globalThis.importAsync = async (id: string): Promise<any> => {
    const importFn = globalThis.imports[id]
    
    if (!importFn) {
        throw new Error(`Module not found: ${id}`)
    }

    return importFn()
}
