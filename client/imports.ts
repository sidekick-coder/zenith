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
const files = {}

Object.assign(files, import.meta.glob('./utils/*', { eager: true }))

for (const [path, mod] of Object.entries(import.meta.glob('./utils/*', { eager: true }))) {
    const id = path.replace('./', '#client/')

    globalThis.imports[id] = mod
    globalThis.imports[id.replace('.ts', '')] = mod
}

for (const [path, mod] of Object.entries(import.meta.glob<any>('./layouts/*.vue', { eager: true }))) {
    const id = path.replace('./', '#client/')

    globalThis.imports[id] = mod.default || mod
    globalThis.imports[id.replace('.vue', '')] = mod.default || mod
}

for (const [path, mod] of Object.entries(import.meta.glob<any>('./components/**/*', { eager: true }))) {
    const id = path.replace('./', '#client/')

    const ext = path.split('.').pop()
    
    globalThis.imports[id] = mod.default || mod
    globalThis.imports[id.replace(`.${ext}`, '')] = mod.default || mod
    
    if (id.endsWith('index.ts')) {
        const indexId = id.replace('/index.ts', '')

        globalThis.imports[indexId] = mod.default || mod
    }
}

for (const [path, mod] of Object.entries(import.meta.glob('./../shared/**', { eager: true }))) {
    const id = path.replace('../shared/', '#shared/')

    globalThis.imports[id] = mod
    globalThis.imports[id.replace('.ts', '')] = mod
}