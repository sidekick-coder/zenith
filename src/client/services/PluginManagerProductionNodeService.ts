import { pathToFileURL } from 'url'
import { container, PluginEntity } from '@sidekick-coder/zenith-kit/client'
import PluginMangerService from './PluginManagerService'

export default class PluginManagerProductionNodeService extends PluginMangerService {
    public imports = new Map<string, any>()

    public async register() {
        const entries = container.has('plugin:entries') ? container.get('plugin:entries') as any[] : []

        for (const e of entries) {
            const url = pathToFileURL(e.entry)

            const importFn = () => import(/* @vite-ignore */ url.href)

            this.imports.set(e.id, importFn)

            if (this.debug) {
                this.logger.debug(`plugin registered (${e.id} v${e.version})`, {
                    context: 'client-node',
                    id: e.id,
                    entry: e.entry
                })
            }
        }
    }

    public async load() {
        const entries = container.has('plugin:entries') ? container.get('plugin:entries') as any[] : []

        for (const e of entries) {
            const fn = this.imports.get(e.id)

            if (!this.imports.has(e.id)) {
                this.logger.warn(`No import found for plugin ${e.id}`)
                continue
            }

            const pluginModule = await fn!()

            const contructor = pluginModule.default as any as typeof PluginEntity

            if (!contructor.from) {
                this.logger.error(`Looks like plugin ${e.id} is not an instance of PluginEntity, missing static from method`)
                continue
            }

            const instance = contructor.from(e)

            await instance.load()

            if (this.debug) {
                this.logger.debug(`plugin loaded (${instance.id} v${instance.version})`, {
                    context: 'client-node',
                    id: instance.id,
                    version: instance.version
                })
            }
        }
    }
}
