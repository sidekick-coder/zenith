import type Module from '#client/entities/module.entity.ts'
import logger from '#client/facades/logger.facade.ts'
import di from '#client/utils/di.ts'
import type ModuleManifest from '#shared/entities/moduleManifest.entity.ts'
import LoggerService from '#shared/services/logger.service.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

export interface ImportModule {
    default: typeof Module
}

export type ImportModuleFunction = () => Promise<ImportModule>

export default class ModulesService {
    public mods: Module[]
    public debug: boolean
    public logger: LoggerService
    public imports: Map<string, ImportModuleFunction>

    constructor(data: Partial<ModulesService> = {}) {
        this.mods = []
        this.debug = data.debug ?? false
        this.logger = data.logger || logger.child({ label: 'modules' })
        this.imports = new Map()

        if (this.debug) {
            this.logger.debug(`${this.constructor.name} service initalized in debug mode`)
        }
    }
    
    public async discover() {
        // implement discovery logic here
    }

    public async load() {
        if (!di.has('modules')) {
            return
        }
        
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

                return new constructor()
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
}