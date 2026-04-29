import fs from 'fs'
import { basePath } from '@sidekick-coder/zenith-kit/server'
import type { HttpContext } from '#server/contracts/httpContext.contract.ts'

const filename = basePath('server/resources/html/reloader.html')

const html = fs.readFileSync(filename, 'utf-8')

export default async function({ }: HttpContext) {
    return html
}
