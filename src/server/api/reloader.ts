import fs from 'fs'
import { defineHandler, serverPath } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'

const filename = serverPath('resources/html/reloader.html')

const html = fs.readFileSync(filename, 'utf-8')

export default defineHandler(async ({ query }) => {
    let result = html 

    const colors = validator.validate(query.colors, v => v.optional(v.extras.object()))

    if (colors) {
        const css = ['<style>', ':root {']

        for (const [key, value] of Object.entries(colors)) {
            css.push(`--${key}: ${value};`)
        }

        css.push('}', '</style>')

        result = result.replace('<!--apphead-->', css.join('\n'))
    }

    return result
})

