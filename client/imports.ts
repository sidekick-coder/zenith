import 'iconify-icon'

globalThis.imports = globalThis.imports || {}

globalThis.imports['vue'] = () => import('vue')
globalThis.imports['reka-ui'] = () => import('reka-ui')
globalThis.imports['vue-router'] = () => import('vue-router')
globalThis.imports['vee-validate'] = () => import('vee-validate')
globalThis.imports['vue-sonner'] = () => import('vue-sonner')


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