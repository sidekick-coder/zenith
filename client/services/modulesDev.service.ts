import ModulesService from './modules.service.ts'
import di from '#client/utils/di.ts'
import type ModuleManifest from '#shared/entities/moduleManifest.entity.ts'

export default class ModulesDevService extends ModulesService {
        
    public async discover() {
        const manifests = di.get<ModuleManifest[]>('modules')
        
        this.imports = new Map()

        const files  = import.meta.glob('../.modules/*.ts', { eager: true })


        const imports: Record<string, any> = {}

        for (const [path, mod] of Object.entries<any>(files)) {
            const id = path.split('/').slice(-1)[0].split('.ts')[0]

            imports[id] = mod.default || mod
        }

    
        for (const [id, importFn] of Object.entries(imports)) {
            const mod = manifests.find(m => m.id === id)

            if (!mod?.enabled) {
                continue
            }
            
            this.imports.set(id, importFn as any)
        }
    }
}
