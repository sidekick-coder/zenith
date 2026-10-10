import path from 'node:path'
import { pathToFileURL } from 'node:url'

// Define exact target file paths for specifiers
const imports = {
    'vue': pathToFileURL(path.resolve(import.meta.dirname, 'node_modules/vue/dist/vue.runtime.esm-bundler.js')).href,
    'vue/server-renderer': pathToFileURL(path.resolve(import.meta.dirname, 'node_modules/@vue/server-renderer/dist/server-renderer.esm-bundler.js')).href,
    'vue-router': pathToFileURL(path.resolve(import.meta.dirname, 'node_modules/vue-router/vue-router.node.mjs')).href,
    'vee-validate': pathToFileURL(path.resolve(import.meta.dirname, 'node_modules/vee-validate/dist/vee-validate.mjs')).href,
}

const checked = new Set()

function check(specifier) {
    if (checked.has(specifier)) {
        return
    }

    checked.add(specifier)

    // ignore relative 
    if (specifier.startsWith('./') || specifier.startsWith('../')) {
        return
    }

    // ignore if specifier is a path URL
    if (specifier.startsWith('file://') || specifier.startsWith('http://') || specifier.startsWith('https://')) {
        return
    }

    if (!specifier.startsWith('/')) {
        return
    }

    console.warn(`Warning: Specifier "${specifier}" may cause issues on windows.`)
}


export async function resolve(specifier, context, nextResolve) {
    check(specifier)

    if (Object.hasOwn(imports, specifier)) {
        return nextResolve(imports[specifier], context)
    }

    return nextResolve(specifier, context)
}
