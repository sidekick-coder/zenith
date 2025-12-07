import ModulesService from './modules.service.ts'
import type { ImportModule } from './modules.service.ts'

export default class ModulesDevService extends ModulesService {
        
    public async discover() {
        this.imports = new Map()

        const imports = import.meta.glob<ImportModule>('/modules/*/client/module.client.ts')    
    
        for (const [path, importFn] of Object.entries(imports)) {
            const id = path.split('/')[2]
            
            this.imports.set(id, importFn)
        }
    }
}