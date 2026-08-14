import 'iconify-icon'

import * as Vue from 'vue'
import * as RekaUI from 'reka-ui'
import * as VueRouter from 'vue-router'
import * as VeeValidate from 'vee-validate'
import * as VueSonner from 'vue-sonner' 
import * as VueUse from '@vueuse/core' 
import * as UnheadVue from '@unhead/vue' 
import * as UnheadVueComponents from '@unhead/vue/components'
import { container, VUE_CONTAINER_KEY, VUE_ROUTER_CONTAINER_KEY, VEE_VALIDATE_CONTAINER_KEY, UNHEAD_VUE_CONTAINER_KEY } from '@sidekick-coder/zenith-kit/client'

globalThis.imports = globalThis.imports || new Map<string, any>()

globalThis.imports.set('vue', () => Promise.resolve(Vue))
globalThis.imports.set('reka-ui', () => Promise.resolve(RekaUI))
globalThis.imports.set('vue-router', () => Promise.resolve(VueRouter))
globalThis.imports.set('vee-validate', () => Promise.resolve(VeeValidate))
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

container.set(VUE_CONTAINER_KEY, Vue)
container.set(VUE_ROUTER_CONTAINER_KEY, VueRouter)
container.set(VEE_VALIDATE_CONTAINER_KEY, VeeValidate)
container.set(UNHEAD_VUE_CONTAINER_KEY, UnheadVue)
