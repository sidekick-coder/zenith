import { mergeConfig, build as viteBuild  } from 'vite'
import type { UserConfig } from 'vite'
import rootLogger from '../facades/logger.facade.ts'
import { createViteImportReplacerPlugin  } from '#server/utils/createViteImportReplacerPlugin.util.ts'
import type { CreateViteImportReplacerPluginOptionsImport } from '#server/utils/createViteImportReplacerPlugin.util.ts'
import type Module from '#server/entities/module.entity.ts'

export interface BaseOptions {
    id: string
}

export default class ModuleBuilderService {
    private logger = rootLogger.child({ label: 'builder' })

    constructor(logger?: typeof rootLogger) {
        if (logger) {
            this.logger = logger.child({ label: 'builder' })
        }
    }

    public async build(mod: Module): Promise<void> {
        const outDirNode = mod.makePath('client-dist/node')
        const outDirBrowser = mod.makePath('client-dist/browser')
        
        const imports: CreateViteImportReplacerPluginOptionsImport[] = [
            { 
                from: 'vue',
                type: 'global_import' 
            },
            { 
                from: 'vue-router',
                type: 'global_import' 
            },
            {
                from: 'vue-sonner',
                type: 'global_import'
            },
            { 
                from: '#client',
                type: 'global_import' 
            },
            { 
                from: '#shared',
                type: 'global_import' 
            },
            { 
                from: 'vee-validate',
                type: 'global_import' 
            },
            { 
                from: 'reka-ui',
                type: 'global_import' 
            },
        ]

        if (mod.build?.imports) {
            imports.push(...mod.build.imports)
        }

        const common: UserConfig =  {
            publicDir: mod.makePath('client/public'),
            plugins: [
                createViteImportReplacerPlugin({
                    imports: imports,
                }),
            ],
            build: {
                manifest: true,
                outDir: outDirNode,
                rollupOptions: {
                    output: {
                        assetFileNames: (assetInfo: any) => {
                            if (assetInfo.name.endsWith('.css')) {
                                return 'styles.css'
                            }

                            return assetInfo.name
                        },
                    },
                    external: (id: string) => {

                        const isExternal = imports.some(imp => {
                            if (imp.from === id) {
                                return true
                            }

                            if (id.startsWith(imp.from + '/')) {
                                return true
                            }
                        })
                        
                        if (isExternal) {
                            return true
                        }


                        return false
                    }
                },
                lib: {
                    entry: mod.makePath('client/module.client.ts'),
                    name: 'module',
                    formats: ['es'] as const,
                    fileName: () => 'module.client.js' // <— force deterministic name
                },
            },
        }

        await viteBuild(mergeConfig(common, {
            build: {
                ssr: true,
                outDir: outDirNode,
            },
        }))

        await viteBuild(mergeConfig(common, {
            define: {
                'process.env.NODE_ENV': JSON.stringify('production'),
                'process.env': '{}',
            },
            build: {
                ssr: false,
                outDir: outDirBrowser,
            },
        }))
    }
}