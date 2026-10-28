import { container, PluginEntity } from '@sidekick-coder/zenith-kit/client'
import PluginMangerService from './PluginManagerService'

export default class PluginManagerProductionBrowserService extends PluginMangerService {
    public imports = new Map<string, any>()

    public async register() {
        const entries = container.has('plugin:entries') ? container.get('plugin:entries') as any[] : []

        for (const e of entries) {
            const url = new URL(e.entry, window.location.origin)

            const importFn = () => import(/* @vite-ignore */ url.toString())

            this.imports.set(e.id, importFn)

            if (this.debug) {
                this.logger.debug(`plugin registered (${e.id} v${e.version})`, {
                    context: 'client-browser',
                    id: e.id,
                    entry: e.entry
                })
            }
        }
    }

    public async load() {
        const entries = container.has('plugin:entries') ? container.get('plugin:entries') as any[] : []

        for (const e of entries) {
            const importFn = this.imports.get(e.id)

            if (!this.imports.has(e.id)) {
                this.logger.warn(`No import found for plugin ${e.id}`)
                continue
            }

            const mod = await importFn!()

            const fn = mod.default || mod 

            if (!fn || !fn.load) {
                this.logger.error(`Looks like plugin ${e.id} is not an instance of PluginEntity, missing load method`)
                continue
            }

            await fn.load()

            if (this.debug) {
                this.logger.debug(`plugin loaded (${e.id} v${e.version})`, {
                    context: 'client-browser',
                    id: e.id,
                    version: e.version
                })
            }
        }
    }
}
