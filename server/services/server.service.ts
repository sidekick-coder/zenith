import fs from 'fs'
import { build as viteBuild } from 'vite'
import chokidar from 'chokidar'
import { logger } from '#server/facades/logger.facade.ts'
import { storagePath } from '#server/utils/paths.ts'

export default class ServerService {
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
        await viteBuild({
            build: {
                sourcemap: false,
                minify: false,
                ssr: 'client/entry-server.ts',
                outDir: storagePath('tmp/dist/server'),
            }
        })

        await viteBuild({ 
            build: { 
                sourcemap: false,
                minify: false,
                cssCodeSplit: false,
                outDir: storagePath('tmp/dist/client')
            } 
        })

        if (fs.existsSync(storagePath('dist'))) {
            await fs.promises.rm(storagePath('dist'), { recursive: true })
        }

        await fs.promises.rename(storagePath('tmp/dist'), storagePath('dist'))

        logger.info('build completed')
    }
}
