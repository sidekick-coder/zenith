import { container, PluginEntity } from '@sidekick-coder/zenith-kit/client'
import PluginMangerService from './PluginManagerService'

export default class PluginManagerDevelopmentService extends PluginMangerService {
    public imports = new Map<string, () => Promise<{ default: PluginEntity}>>()

    public async register() {
        const files = import.meta.glob('../.plugins/*.ts', { eager: true })

        const imports: Record<string, any> = {}

        for (const [path, mod] of Object.entries<any>(files)) {
            const id = path.split('/').slice(-1)[0].split('.ts')[0]

            imports[id] = mod.default || mod
        }

        for (const [id, importFn] of Object.entries(imports)) {
            this.imports.set(id, importFn as any)
        }

        if (this.debug) {
            this.logger.debug(`Discovered ${this.imports.size} plugin entries in development mode`, { entries: Array.from(this.imports.keys()) })
        }
    }

    public async load() {
        if (!container.has('plugin:entries')) {
            this.logger.warn('No plugin entries found in container')
            return
        }

        const entries = container.get('plugin:entries') as any[]

        for (const e of entries) {
            const importFn  = this.imports.get(e.id)

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
                this.logger.debug(`Loaded plugin (${e.id} v${e.version}) in development mode`, {
                    id: e.id,
                    version: e.version 
                })
            }
        }
    }
}
