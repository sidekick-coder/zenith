import { createFilter } from '@rollup/pluginutils'
import MagicString from 'magic-string'
import * as acorn from 'acorn'
import type { Plugin } from 'vite'

export interface CreateViteImportReplacerPluginOptionsImport {
    from: string
    to?: string
    type: 'global_import'
}

export interface CreateViteImportReplacerPluginOptions {
    imports?: CreateViteImportReplacerPluginOptionsImport[]
    include?: string | string[]
    exclude?: string | string[]
}

export function createViteImportReplacerPlugin(options: CreateViteImportReplacerPluginOptions): Plugin {
    const include = options.include || '**/*.js'
    const exclude = options.exclude || 'node_modules/**'
    const imports = options.imports || []

    const filter = createFilter(include, exclude)

    return {
        name: 'vite-import-replacer',
        enforce: 'post',
        renderChunk(code: string, chunk: any) {
            const id = chunk.fileName
            
            if (!filter(id)) return null
            
            if (!code.includes('import')) return null

            const s = new MagicString(code)
            let hasChanges = false
            
            const ast = acorn.parse(code, {
                sourceType: 'module',
                ecmaVersion: 2022
            }) as any

            const importNodes = ast.body.filter((node: any) => node.type === 'ImportDeclaration').reverse()

            for (const node of importNodes) {
                const importSource = node.source.value
                
                const modulesFromList = imports.map(imp => imp.from)
                const isExternalModule = modulesFromList.includes(importSource)
                    
                const isExternalModuleSubpath = modulesFromList.some(baseModule => 
                    importSource.startsWith(baseModule + '/') && importSource !== baseModule
                )
                    
                const isAliasPath = importSource.startsWith('#client') || importSource.startsWith('#shared')
                    
                if (isExternalModule || isExternalModuleSubpath || isAliasPath) {
                    if (node.specifiers.length === 0) {
                        const replacement = `await globalThis.importAsync("${importSource}");`
                        s.overwrite(node.start, node.end, replacement)
                        hasChanges = true
                    } else {
                        const replacements = node.specifiers.map((spec: any) => {
                            const localName = spec.local.name
                            let replacement = ''

                            if (spec.type === 'ImportSpecifier') {
                                const importedName = spec.imported.name
                                replacement = `const { ${importedName}: ${localName} } = await globalThis.importAsync("${importSource}");`
                            } 
                            
                            if (spec.type === 'ImportDefaultSpecifier') {
                                const moduleVarName = `__module__${localName}__`
                                replacement = `const ${moduleVarName} = await globalThis.importAsync("${importSource}"); const ${localName} = ${moduleVarName}.default || ${moduleVarName};`
                            } 
                            
                            if (spec.type === 'ImportNamespaceSpecifier') {
                                replacement = `const ${localName} = await globalThis.importAsync("${importSource}");`
                            }
                            
                            return replacement
                        }).filter(Boolean)
                            .join('\n')

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
