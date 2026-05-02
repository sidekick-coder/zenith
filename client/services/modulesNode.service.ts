import { pathToFileURL } from 'url'
import { basePath } from '@sidekick-coder/zenith-kit/server'
import ModulesService from './modules.service.ts'
import di from '#client/utils/di.ts'
import type ModuleManifest from '#shared/entities/moduleManifest.entity.ts'

export default class ModulesNodeService extends ModulesService {     
    public async discover() {
        const manifests = di.get<ModuleManifest[]>('modules')

        console.log('ModulesNodeService: discovering modules', manifests)

        for (const manifest of manifests) {
            if (!manifest.entrypoints?.node) {
                const url = pathToFileURL(manifest.entrypoints.node)

                const importFn = () => import(/* @vite-ignore */ url.href)

                this.imports.set(manifest.id, importFn)
            }

            // remove the filenames 
            delete manifest.entrypoints.node 
            delete manifest.entrypoints.dev
        }

        di.set('modules', manifests)
    }
}
