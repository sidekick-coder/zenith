import path from 'path'
import { mergeConfig, build as viteBuild  } from 'vite'
import type { UserConfig } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import MagicString from 'magic-string'
import * as acorn from 'acorn'
import rootLogger from '../facades/logger.facade.ts'
import shell from './shell.service.ts'
import { basePath } from '#server/utils/paths.ts'


const modulesToReplace = ['vue', 'vue-router', '#client', '#shared', 'vee-validate', 'reka-ui']

function customImportReplacer() {
    const filter = createFilter('**/*.js', 'node_modules/**')

    return {
        name: 'custom-import-replacer',
        enforce: 'post' as const, // Run after other transformations to handle generated code
        renderChunk(code: string, chunk: any) {
            const id = chunk.fileName
            
            if (!filter(id)) return null
            
            // Skip if no imports to transform
            if (!code.includes('import')) return null

            const s = new MagicString(code)
            let hasChanges = false
            // Parse with acorn - use basic JS parsing since we're dealing with compiled output
            const ast = acorn.parse(code, {
                sourceType: 'module',
                ecmaVersion: 2022
            }) as any

            // Process import declarations in reverse order to maintain string indices
            const importNodes = ast.body.filter((node: any) => node.type === 'ImportDeclaration').reverse()

            for (const node of importNodes) {
                const importSource = node.source.value
                
                // Check if it's a direct external module (like 'vue') or one of your aliases
                const isExternalModule = modulesToReplace.includes(importSource)
                    
                // Check for subpaths of external modules (like 'vue/server-renderer')
                const isExternalModuleSubpath = modulesToReplace.some(baseModule => 
                    importSource.startsWith(baseModule + '/') && importSource !== baseModule
                )
                    
                const isAliasPath = importSource.startsWith('#client') || importSource.startsWith('#shared')
                    
                if (isExternalModule || isExternalModuleSubpath || isAliasPath) {
                    // Use importSource directly as the ID for globalThis.importAsync

                    // Handle different types of imports
                    if (node.specifiers.length === 0) {
                        // Side-effect import: import 'module'
                        // For side-effect imports, we just need to execute the module
                        const replacement = `await globalThis.importAsync("${importSource}");`
                        s.overwrite(node.start, node.end, replacement)
                        hasChanges = true
                    } else {
                        // Imports with specifiers
                        const replacements = node.specifiers.map((spec: any) => {
                            const localName = spec.local.name
                            let replacement = ''

                            if (spec.type === 'ImportSpecifier') {
                                // import { imported as local } from 'module'
                                const importedName = spec.imported.name
                                replacement = `const { ${importedName}: ${localName} } = await globalThis.importAsync("${importSource}");`
                            } else if (spec.type === 'ImportDefaultSpecifier') {
                                // import local from 'module'
                                const moduleVarName = `__module__${localName}__`
                                replacement = `const ${moduleVarName} = await globalThis.importAsync("${importSource}"); const ${localName} = ${moduleVarName}.default || ${moduleVarName};`
                            } else if (spec.type === 'ImportNamespaceSpecifier') {
                                // import * as local from 'module'
                                replacement = `const ${localName} = await globalThis.importAsync("${importSource}");`
                            }
                            return replacement
                        }).filter(Boolean)
                            .join('\n')

                        // 3. Replace the entire import statement
                        if (replacements) {
                            s.overwrite(node.start, node.end, replacements)
                            hasChanges = true
                        }
                    }
                }
            }

            if (!hasChanges) return null

            return {
                code: s.toString(),
                map: s.generateMap({ hires: true }),
            }
        },
    }
}

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

        const common: UserConfig =  {
            publicDir: path.join(moduleDir, 'client/public'),
            plugins: [
                customImportReplacer(),
            ],
            build: {
                outDir: outDirServer,
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
                        // Check exact match
                        if (this.externals.includes(id)) {
                            return true
                        }

                        // Check for subpaths of external modules (e.g., vue/server-renderer)
                        if (this.externals.some(external => id.startsWith(external + '/'))) {
                            return true
                        }

                        // Check for alias paths
                        if (id.startsWith('#shared') || id.startsWith('#client')) {
                            return true
                        }

                        return false
                    }
                },
                lib: {
                    entry: path.join(moduleDir, 'client/setup.client.ts'),
                    name: 'setupClient',
                    formats: ['es'] as const,
                    fileName: () => 'setup.client.js' // <— force deterministic name
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
    }
}