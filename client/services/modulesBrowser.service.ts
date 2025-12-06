import ModulesService from './modules.service.ts'
import ModuleManifest from '#shared/entities/moduleManifest.entity.ts'
import di from '#client/utils/di.ts'
import Module from '#client/entities/module.entity.ts'

export default class ModulesBrowserService extends ModulesService {
   

    public async discover() {
        const manifests = di.get<ModuleManifest[]>('modules')

        for (const manifest of manifests) {
            const url = new URL(`/static/modules/${manifest.id}/module.client.ts`, window.location.origin)

            console.log(url.toString())

            // const url = filename + `?t=${Date.now()}` // bust cache
            
            // const [error, mod] = await tryCatch(async () => await import(/* @vite-ignore */ url))
        
            // if (error) {
            //     console.error('Error importing setup file:', error)
            //     return null
            // }
        
            // return mod
        }

    }
    public async load() {
        // implement load logic here
    }
}