import { pathToFileURL } from 'url'
import ModulesService from './modules.service.ts'
import di from '#client/utils/di.ts'
import type ModuleManifest from '#shared/entities/moduleManifest.entity.ts'
import { basePath } from '#server/utils/paths.ts'

export default class ModulesNodeService extends ModulesService {     
    public async discover() {
        const manifests = di.get<ModuleManifest[]>('modules')

        for (const manifest of manifests) {
            const filepath = basePath('modules', manifest.id, 'client-dist', 'node', 'module.client.js')

            const url = pathToFileURL(filepath)

            url.searchParams.set('t', Date.now().toString()) // bust cache

            const importFn = () => import(/* @vite-ignore */ url.href)

            this.imports.set(manifest.id, importFn)
        }
    }
}