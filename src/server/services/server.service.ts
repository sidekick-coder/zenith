import fs from 'fs'
import { mergeConfig, build as viteBuild } from 'vite'
import type { UserConfig } from 'vite'
import { basePath } from '@sidekick-coder/zenith-kit/server'
import fg from 'fast-glob'
import { logger } from '#server/facades/logger.facade.ts'

export default class ServerService {
    public reload() {
        logger.info('reload server')

        process.send?.('server-restart')
    }

    public async build() {

        // remove .plugins files 
        const files = await fg(basePath('client/.plugins/*.ts'))

        for (const file of files) {
            logger.debug(`removing ${file}`)

            fs.rmSync(file)
        }


        const common: UserConfig = {
            resolve: {
                alias: {
                    '#client': basePath('client'),
                    '#shared': basePath('shared'),
                }
            }
        }

        await viteBuild(mergeConfig(common, {
            build: {
                ssr: 'client/entry-node.ts',
                outDir: basePath('dist/client-node'),
            },
        }))

        await viteBuild(mergeConfig(common, {
            build: {
                outDir: basePath('dist/client-browser'),
                manifest: true,
                rollupOptions: { input: { app: 'client/entry-browser.ts', } },
            },
        }))

        logger.info('build completed')
    }
}
