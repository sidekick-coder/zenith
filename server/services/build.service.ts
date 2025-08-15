import { build as viteBuild } from 'vite'
import { logger } from '../facades/logger.facade.ts'

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
    }
}

const build = new BuildService()

export default build
