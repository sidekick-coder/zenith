import { build as viteBuild } from 'vite'
import chokidar from 'chokidar'
import { logger } from '../facades/logger.facade.ts'
import { basePath } from '#server/utils/paths.ts'

export class BuildService {
    private building = true
    private async server(){
        await viteBuild({
            build: {
                ssr: 'client/entry-server.ts',
                outDir: 'client/dist-server',
            }
        })

        logger.debug('Server build completed')
    }

    private async client() {
        await viteBuild({
            build: {
                outDir: 'client/dist-client',
                // rollupOptions: { input: 'client/index.html', },
            },
        })

        logger.debug('Client build completed')
    }

    public reloadServer(){
        process.send?.('server-restart')
    }

    public async all() {
        this.building = true

        await this.server()
        await this.client()

        this.building = false

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

        const onChange = () => {
            if (this.building) return 

            this.reloadServer()
        }

        watcher
            .on('change', onChange)
            .on('add', onChange)
            .on('unlink', onChange)
        
        watcher.on('ready', () => {
            logger.debug('Dist directories watcher is ready')
        })

        return watcher
    }
}

const build = new BuildService()

export default build
