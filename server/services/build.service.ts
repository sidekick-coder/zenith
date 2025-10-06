import fs from 'fs'
import { build as viteBuild } from 'vite'
import chokidar from 'chokidar'
import { logger } from '../facades/logger.facade.ts'
import { storagePath } from '#server/utils/paths.ts'

export class BuildService {

    public reloadServer(){
        logger.info('reload server')

        process.send?.('server-restart')
    }

    public watch() {
        const distDir = storagePath('dist')

        const watcher = chokidar.watch(distDir, {
            persistent: true,
            ignoreInitial: true
        })
            
        const onChange = () => {
            this.reloadServer()
        }
            
        watcher.on('change', onChange)
        watcher.on('add', onChange)
        watcher.on('unlink', onChange)
            
        return watcher
    }

    public async build() {        
        await viteBuild({
            build: {
                ssr: 'client/entry-server.ts',
                outDir: storagePath('tmp/dist/server'),
            }
        })

        await viteBuild({ build: { outDir: storagePath('tmp/dist/client') } })

        await fs.promises.rm(storagePath('dist'), { recursive: true })
        await fs.renameSync(storagePath('tmp/dist'), storagePath('dist'))

        logger.info('build completed')
    }
}

const build = new BuildService()

export default build
