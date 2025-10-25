import fs from 'fs'
import { mergeConfig, build as viteBuild } from 'vite'
import chokidar from 'chokidar'
import { logger } from '#server/facades/logger.facade.ts'
import { basePath, storagePath, tmpPath } from '#server/utils/paths.ts'
import ServerBooterService from '#modules/artlyze/root/server/services/serverBooter.service.ts'

export default class ServerService {
    public booter = new ServerBooterService()

    public reload(){
        logger.info('reload server')

        process.send?.('server-restart')
    }

    public watch() {
        const distDir = storagePath('dist')

        const watcher = chokidar.watch(distDir, {
            persistent: true,
            ignoreInitial: true
        })
            
        const onChange = () => this.reload()

        watcher.on('change', onChange)
        watcher.on('add', onChange)
        watcher.on('unlink', onChange)
            
        return watcher
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
            publicDir: 'client/public',
            build: {
                ssr: 'client/entry-server.ts',
                outDir: tmpPath('dist/server'),
            },
        }))

        await viteBuild(mergeConfig(common, { 
            build: {
                outDir: tmpPath('dist/client'),
                rollupOptions: { 
                    input: { app: 'client/index.html', },
                },
            },
        }))

        if (fs.existsSync(basePath('dist'))) {
            await fs.promises.rm(basePath('dist'), { recursive: true })
        }

        await fs.promises.rename(basePath('tmp/dist'), basePath('dist'))

        logger.info('build completed')
    }
}
