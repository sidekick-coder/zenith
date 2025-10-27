import fs from 'fs'
import { mergeConfig, build as viteBuild } from 'vite'
import chokidar from 'chokidar'
import { logger } from '#server/facades/logger.facade.ts'
import { basePath, storagePath } from '#server/utils/paths.ts'
import ServerBooterService from '#server/services/serverBooter.service.ts'

export default class ServerService {
    public booter = new ServerBooterService()

    public reload(){
        logger.info('reload server')

        process.send?.('server-restart')
    }

    public async build() {
        
        const common = {
            publicDir: 'client/public',
            resolve: { 
                alias: {
                    '#client': basePath('client'),
                    '#shared': basePath('shared'),
                }
            },
        }

        await viteBuild(mergeConfig(common, {
            build: {
                ssr: 'client/entry-server.ts',
                outDir: basePath('client-dist/server'),
            },
        }))

        await viteBuild(mergeConfig(common, { 
            build: {
                outDir: basePath('client-dist/client'),
                rollupOptions: { 
                    input: { app: 'client/index.html', },
                },
            },
        }))

        logger.info('build completed')
    }
}
