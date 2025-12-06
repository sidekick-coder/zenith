import ModulesService from './modules.service.ts'
import ModuleManifest from '#shared/entities/moduleManifest.entity.ts'
import di from '#client/utils/di.ts'
import Module from '#client/entities/module.entity.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

export default class ModulesDevService extends ModulesService {    
    public imports: Map<string, () => Promise<any>>
    
    constructor(data: Partial<ModulesService> = {}) {
        super(data)

        this.imports = new Map()

        const imports = import.meta.glob('/modules/*/client/module.client.ts')    
    
        for (const [path, importFn] of Object.entries(imports)) {
            const id = path.split('/')[2]
            
            this.imports.set(id, importFn)
        }
    }
        
    public async discover() {
        const manifests = di.get<ModuleManifest[]>('modules')

        for (const manifest of manifests) {
            const importFn = this.imports.get(manifest.id)

            if (!importFn) {
                console.warn(`No import function found for module ${manifest.id}`)
                continue
            }

            const [error, mod] = await tryCatch(async () => {
                const modImport = await importFn()

                const constructor = modImport.default || modImport

                return new constructor() as Module
            })

            if (error) {
                this.logger.error(`Error importing module ${manifest.id}:`, error)
                continue
            }

            mod.setData(manifest)

            this.mods.push(mod as Module)

            if (this.debug) {
                this.logger.debug(`module import ${manifest.id}`)
            }
        }

    }
    public async load() {
        // implement load logic here
    }
}