import config from "./config.service.ts";
import { logger } from "../logger.ts";
import { basePath } from "../utils/paths.ts";
import * as fs from 'fs';
import path from "path";
import { build as viteBuild, mergeConfig } from 'vite'

export class BuildService {
    public async server(){
        await viteBuild({
            build: {
                ssr: 'client/entry-server.ts',
                outDir: 'client/dist/server',
            }
        });

        logger.debug('Server build completed');
    }

    public async client() {
        await viteBuild({
            build: {
                outDir: 'client/dist/client',
                rollupOptions: {
                    input: 'client/index.html',
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
