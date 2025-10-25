import path from 'path'
import fs from 'fs/promises'
import fg from 'fast-glob'
import { mergeConfig, build as viteBuild } from 'vite'
import rootLogger from '../facades/logger.facade.ts'
import shell from './shell.service.ts'
import { basePath, storagePath } from '#server/utils/paths.ts'

export interface BaseOptions {
    id: string
}

export default class ModuleBuilderService {
    private logger = rootLogger.child({ label: 'builder' })
    private shell = shell

    private externals = [
        'vue',
        'vue-router', 
        'reka-ui',
        'vee-validate',

    ]

    constructor(
        logger?: typeof rootLogger,
    ) {
        if (logger) {
            this.logger = logger.child({ label: 'builder' })
        }
    }

    public async build(moduleId: string): Promise<void> {
        const modulesPath = basePath('modules')
        const moduleDir = path.join(modulesPath, moduleId)

        const outDirServer = path.join(moduleDir, 'dist/server')
        const outDirClient = path.join(moduleDir, 'dist/client')

        const common =  {
            publicDir: path.join(moduleDir, 'client/public'),
            
            build: {
                outDir: outDirServer,
                lib: {
                    entry: path.join(moduleDir, 'client/setup.client.ts'),
                    // name: 'setupClient',
                    formats: ['esm'],
                    fileName: () => 'setup.client.js' // <— force deterministic name
                },
                rollupOptions: {
                    external: (id: string) => {
                        if (this.externals.includes(id)) {
                            return true
                        }

                        if (id.startsWith('#shared') || id.startsWith('#client')) {
                            return true
                        }

                        return false
                    }
                },
            },
        }

        await viteBuild(mergeConfig(common, {
            build: {
                ssr: true,
                outDir: outDirServer,
            },
        }))

        await viteBuild(mergeConfig(common, {
            define: {
                'process.env.NODE_ENV': JSON.stringify('production'),
                'process.env': '{}',
            },
            build: {
                ssr: false,
                outDir: outDirClient,
            },
        }))

        await this.postbuild(moduleId)
    }

    public async postbuild(moduleId: string): Promise<void> {
        const files = [] as string[]

        const serverFiles = await fg('**/*', {
            cwd: basePath('modules', moduleId, 'dist', 'server'),
            onlyFiles: true,
            absolute: true,
        })

        const clientFiles = await fg('**/*', {
            cwd: basePath('modules', moduleId, 'dist', 'client'),
            onlyFiles: true,
            absolute: true,
        })

        files.push(...serverFiles as string[], ...clientFiles as string[])

        const imports = this.externals
        
        for (const filename of files as string[]) {
            let content = await fs.readFile(filename, 'utf-8')

            // Handle imports dynamically for all modules in the imports array
            for (const moduleImport of imports) {
                const escapedModule = moduleImport.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
                
                content = content.replace(
                    new RegExp(`import\\s+(\\{[^}]+\\}|\\*\\s+as\\s+\\w+|\\w+)\\s+from\\s+['"]${escapedModule}['"];?`, 'g'),
                    (match, importPart) => {
                        // Convert "as" to ":" in destructured imports - handle special chars like $
                        const convertedImport = importPart.replace(/\b(\w+)\s+as\s+([^\s,}]+)/g, '$1: $2')
                        return `const ${convertedImport} = globalThis.imports['${moduleImport}'];`
                    }
                )
            }

            // Handle #client and #shared imports
            content = content.replace(
                /import\s+(\{[^}]+\}|\*\s+as\s+\w+|[\w$]+)\s+from\s+['"]#(client|shared)\/([^'"]+)['"];?/g,
                (match, importPart, scope, modulePath) => {
                    // Convert "as" to ":" in destructured imports
                    const convertedImport = importPart.replace(/\b(\w+)\s+as\s+([^\s,}]+)/g, '$1: $2')
                    return `const ${convertedImport} = globalThis.imports['#${scope}/${modulePath}'];`
                }
            )

            // Fix any remaining "as" keywords in const destructuring assignments from any imports
            const importsPattern = imports.map(imp => imp.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')).join('|')
            content = content.replace(
                new RegExp(`const\\s+\\{([^}]+)\\}\\s+=\\s+globalThis\\.imports\\['(${importsPattern}|#(?:client|shared)\\/[^']+)'];`, 'g'),
                (match, destructuring, moduleImport) => {
                    const fixedDestructuring = destructuring.replace(/\b(\w+)\s+as\s+([^\s,}]+)/g, '$1: $2')
                    return `const {${fixedDestructuring}} = globalThis.imports['${moduleImport}'];`
                }
            )

            await fs.writeFile(filename, content, 'utf-8')
        }
    }
    
}