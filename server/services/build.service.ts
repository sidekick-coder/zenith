import { build as viteBuild } from 'vite'
import { logger } from '../facades/logger.facade.ts'

export class BuildService {
    public async server(){
        await viteBuild({
            build: {
                ssr: 'client/entry-server.ts',
                outDir: 'storage/dist/server',
            }
        })

        logger.debug('Server build completed')
    }

    public async client() {
        await viteBuild({ build: { outDir: 'storage/dist/client', }, })

        logger.debug('Client build completed')
    }

    public reloadServer(){
        logger.info('reload server')

        process.send?.('server-restart')
    }

    public async all() {
        await this.server()
        await this.client()
    }
}

const build = new BuildService()

export default build
