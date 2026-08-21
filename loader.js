import path from 'node:path'
import { pathToFileURL } from 'node:url'

// Define exact target file paths for specifiers
const imports = {
    'vue': pathToFileURL(path.resolve(import.meta.dirname, 'node_modules/vue/dist/vue.runtime.esm-bundler.js')).href,
    'vee-validate': pathToFileURL(path.resolve(import.meta.dirname, 'node_modules/vee-validate/dist/vee-validate.mjs')).href,
}


export async function resolve(specifier, context, nextResolve) {
    if (Object.hasOwn(imports, specifier)) {
        return nextResolve(imports[specifier], context)
    }

    return nextResolve(specifier, context)
}
