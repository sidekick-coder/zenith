import { logger } from "../logger.ts";
import { build as viteBuild } from 'vite'

export class BuildService {
    public async server(){
        await viteBuild({
            build: {
                ssr: 'app/entry-server.ts',
                outDir: 'app/dist/server',
            }
        });

        logger.debug('Server build completed');
    }

    public async client() {
        await viteBuild({
            build: {
                outDir: 'app/dist/client',
                rollupOptions: {
                    input: 'index.html',
                },
            },
        });

        logger.debug('Client build completed');
    }

    public async all() {
        await this.server();
        await this.client();
    }
}

const build = new BuildService();

export default build;
