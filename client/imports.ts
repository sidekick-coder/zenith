import 'iconify-icon'

import * as Vue from 'vue'
import * as RekaUI from 'reka-ui'
import * as VueRouter from 'vue-router'
import * as VeeValidate from 'vee-validate'
import * as VueSonner from 'vue-sonner' 
import * as VueUse from '@vueuse/core' 
import * as UnheadVue from '@unhead/vue' 
import * as UnheadVueComponents from '@unhead/vue/components'

globalThis.imports = globalThis.imports || new Map<string, any>()

globalThis.imports.set('vue', () => Promise.resolve(Vue))
globalThis.imports.set('reka-ui', () => Promise.resolve(RekaUI))
globalThis.imports.set('vue-router', () => Promise.resolve(VueRouter))
globalThis.imports.set('vee-validate', () => Promise.resolve(VeeValidate))
globalThis.imports.set('static:vee-validate', VeeValidate)
globalThis.imports.set('vue-sonner', () => Promise.resolve(VueSonner))
globalThis.imports.set('@vueuse/core', () => Promise.resolve(VueUse))
globalThis.imports.set('@unhead/vue', () => Promise.resolve(UnheadVue))
globalThis.imports.set('@unhead/vue/components', () => Promise.resolve(UnheadVueComponents))
globalThis.importAsync = async (id: string): Promise<any> => {
    const importFn = globalThis.imports.get(id)

    if (!importFn) {
        throw new Error(`Module not found: ${id}`)
    }

    return importFn()
}

//
// // Handle #client and #shared imports
// for (const [path, mod] of Object.entries(import.meta.glob('./{lib,utils,entities,guards,facades,composables,components}/**/*.ts'))) {
//     const id = path.replace('./', '#client/')
//
//     globalThis.imports.set(id, mod)
//     globalThis.imports.set(id.replace('.ts', ''), mod)
//
//     if (path.endsWith('index.ts')) {
//         const indexId = id.replace('/index.ts', '')
//
//         globalThis.imports.set(indexId, mod)
//     }
// }
//
// for (const [path, importFn] of Object.entries(import.meta.glob<any>('./{components,layouts}/**/*.vue'))) {
//     const id = path.replace('./', '#client/')
//
//     const ext = path.split('.').pop()
//
//     globalThis.imports.set(id, importFn)
//     globalThis.imports.set(id.replace(`.${ext}`, ''), importFn)
// }
//
// for (const [path, mod] of Object.entries(import.meta.glob('./../shared/**'))) {
//     const id = path.replace('../shared/', '#shared/')
//
//     globalThis.imports.set(id, mod)
//     globalThis.imports.set(id.replace('.ts', ''), mod)
// }
//
