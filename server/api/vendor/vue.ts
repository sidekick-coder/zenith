import fs from 'node:fs'
import { basePath, defineHandler } from '@sidekick-coder/zenith-kit/server'

const cached: string | null = null

export default defineHandler(async ({ response }) => {
    response.setHeader('Content-Type', 'application/javascript')

    if (cached) {
        return cached
    }

    const vueFilename = basePath('node_modules', 'vue', 'dist', 'vue.runtime.esm-browser.js')

    const content = fs.promises.readFile(vueFilename, 'utf-8')

    return content
})
