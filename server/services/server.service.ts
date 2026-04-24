import { mergeConfig, build as viteBuild  } from 'vite'
import type { UserConfig } from 'vite'
import { logger } from '#server/facades/logger.facade.ts'
import { basePath } from '#server/utils/paths.ts'

export default class ServerService {
    public reload(){
        logger.info('reload server')

        process.send?.('server-restart')
    }

    public async build() {
        
        const common: UserConfig = {
            resolve: { 
                alias: {
                    '#client': basePath('client'),
                    '#shared': basePath('shared'),
                }
            },
            build: {
                manifest: true,
                rollupOptions: {
                    external: (id: string) => {
                        if (id.startsWith(basePath('modules'))) {
                            return true
                        }

                        return false
                    }
                }
            }
        }

        await viteBuild(mergeConfig(common, {
            build: {
                ssr: 'client/entry-server.ts',
                outDir: basePath('client-dist/node'),
            },
        }))

        await viteBuild(mergeConfig(common, { 
            build: {
                outDir: basePath('client-dist/browser'),
                rollupOptions: { input: { app: 'client/entry-client.ts', }, },
            },
        }))

        logger.info('build completed')
    }
}
