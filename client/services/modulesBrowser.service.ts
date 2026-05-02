import ModulesService from './modules.service.ts'
import type { ImportModuleFunction } from './modules.service.ts'
import ModuleManifest from '#shared/entities/moduleManifest.entity.ts'
import di from '#client/utils/di.ts'

export default class ModulesBrowserService extends ModulesService {
    public async discover() {
        const manifests = di.get<ModuleManifest[]>('modules')

        console.log('ModulesBrowserService: discovering modules', manifests)


        for (const manifest of manifests) {
            if (!manifest.entrypoints?.browser) continue 

            const url = new URL(manifest.entrypoints.browser, window.location.origin)

            const importFn: ImportModuleFunction = () => import(/* @vite-ignore */ url.toString())

            this.imports.set(manifest.id, importFn)
        }

    }
}
