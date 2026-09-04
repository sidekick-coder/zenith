import fs from 'fs'
import { serverPath } from '@sidekick-coder/zenith-kit/server'

const filename = serverPath('resources/html/reloader.html')

const html = fs.readFileSync(filename, 'utf-8')

export default async function() {
    return html
}
