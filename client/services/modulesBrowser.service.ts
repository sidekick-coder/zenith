import ModulesService from './modules.service.ts'
import type { ImportModuleFunction } from './modules.service.ts'
import ModuleManifest from '#shared/entities/moduleManifest.entity.ts'
import di from '#client/utils/di.ts'

export default class ModulesBrowserService extends ModulesService {
    public async discover() {
        const manifests = di.get<ModuleManifest[]>('modules')

        for (const manifest of manifests) {
            const url = new URL(`/static/modules/${manifest.id}/browser/module.client.js`, window.location.origin)

            url.searchParams.set('t', Date.now().toString()) // bust cache

            const importFn: ImportModuleFunction = () => import(/* @vite-ignore */ url.toString())

            this.imports.set(manifest.id, importFn)
        }

    }
}