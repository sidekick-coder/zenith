import { pathToFileURL } from 'url'
import ModulesService from './modules.service.ts'
import di from '#client/utils/di.ts'
import type ModuleManifest from '#shared/entities/moduleManifest.entity.ts'

export default class ModulesNodeService extends ModulesService {     
    public async discover() {
        const manifests = di.get<ModuleManifest[]>('modules')

        for (const manifest of manifests) {
            if (!manifest.entrypoints?.node) {
                const url = pathToFileURL(manifest.entrypoints.node)

                const importFn = () => import(/* @vite-ignore */ url.href)

                this.imports.set(manifest.id, importFn)
            }
        }

        const publicManifests = manifests.map(manifest => ({
            id: manifest.id,
            name: manifest.name,
            description: manifest.description,
            version: manifest.version,
            entrypoints: { browser: manifest.entrypoints.browser, }
        }))

        di.set('modules', publicManifests)
    }
}
