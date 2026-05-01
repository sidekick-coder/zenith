import ModulesService from './modules.service.ts'
import di from '#client/utils/di.ts'
import type ModuleManifest from '#shared/entities/moduleManifest.entity.ts'

export default class ModulesDevService extends ModulesService {
        
    public async discover() {
        const manifests = di.get<ModuleManifest[]>('modules')
        
        this.imports = new Map()

        let imports: any = await import('#client/.runtime/modules.ts')

        imports = imports.default || imports

    
        for (const [id, importFn] of Object.entries(imports)) {
            const mod = manifests.find(m => m.id === id)

            if (!mod?.enabled) {
                continue
            }
            
            this.imports.set(id, importFn as any)
        }
    }
}
