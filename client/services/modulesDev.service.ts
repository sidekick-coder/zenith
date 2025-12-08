import ModulesService from './modules.service.ts'
import type { ImportModule } from './modules.service.ts'
import di from '#client/utils/di.ts'
import type ModuleManifest from '#shared/entities/moduleManifest.entity.ts'

export default class ModulesDevService extends ModulesService {
        
    public async discover() {
        const manifests = di.get<ModuleManifest[]>('modules')
        
        this.imports = new Map()

        const imports = import.meta.glob<ImportModule>('/modules/*/client/module.client.ts')
    
        for (const [path, importFn] of Object.entries(imports)) {
            const id = path.split('/')[2]
            const mod = manifests.find(m => m.id === id)

            if (!mod?.enabled) {
                continue
            }
            
            this.imports.set(id, importFn)
        }
    }
}