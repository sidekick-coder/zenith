import fs from 'node:fs'
import { basePath, defineHandler } from '@sidekick-coder/zenith-kit/server'
import { BaseException } from '@sidekick-coder/zenith-kit/shared'


const modules: Record<string, string> = {
    'vue': basePath('node_modules', 'vue', 'dist', 'vue.runtime.esm-browser.prod.js'),
    'vee-validate': basePath('node_modules', 'vee-validate/dist/vee-validate.mjs'),
}

export default defineHandler(async ({ response, params }) => {
    let id = params.id as string

    if (id.endsWith('.js')) {
        id = id.slice(0, -3)
    }

    const filename = modules[id]

    if (!filename) {
        throw new BaseException(`Module ${id} not found`, 404)
    }

    response.setHeader('Content-Type', 'application/javascript')

    const content = fs.promises.readFile(filename, 'utf-8')

    return content
})
