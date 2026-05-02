import fs from 'fs'
import fg from 'fast-glob'
import { basePath } from '@sidekick-coder/zenith-kit/server'
import build from '#server/facades/server.facade.ts'
import arte from '#server/facades/arte.facade.ts'

arte.command('build')
    .action(async () => {
        // remove .modules files 
        const files = await fg(basePath('client/.modules/*.ts'))

        for (const file of files) {
            fs.rmSync(file)
        }

        await build.build()
    })
