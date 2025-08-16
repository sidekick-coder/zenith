import { build as viteBuild } from 'vite'
import chokidar from 'chokidar'
import { logger } from '../facades/logger.facade.ts'
import { basePath } from '#server/utils/paths.ts'

export class BuildService {
    public async server(){
        await viteBuild({
            build: {
                ssr: 'client/entry-server.ts',
                outDir: 'client/dist-server',
            }
        })

        logger.debug('Server build completed')
    }

    public async client() {
        await viteBuild({
            build: {
                outDir: 'client/dist-client',
                // rollupOptions: { input: 'client/index.html', },
            },
        })

        logger.debug('Client build completed')
    }

    public async all() {
        await this.server()
        await this.client()

        process.send?.('server-restart')
    }

    public watchDistDirectories() {
        const distPaths = [
            basePath('client/dist-client'),
            basePath('client/dist-server')
        ]

        logger.debug('Watching dist directories for changes:', distPaths)

        const watcher = chokidar.watch(distPaths, {
            persistent: true,
            ignoreInitial: true,
            ignored: /(^|[/\\])\../, // ignore dotfiles
        })

        watcher.on('change', (path) => {
            logger.debug(`Dist file changed: ${path}`)
            process.send?.('server-restart')
        })

        watcher.on('add', (path) => {
            logger.debug(`Dist file added: ${path}`)
            process.send?.('server-restart')
        })

        watcher.on('unlink', (path) => {
            logger.debug(`Dist file removed: ${path}`)
            process.send?.('server-restart')
        })

        watcher.on('error', (error) => {
            logger.error('Dist watcher error:', error)
        })

        watcher.on('ready', () => {
            logger.debug('Dist directories watcher is ready')
        })

        return watcher
    }
}

const build = new BuildService()

export default build
