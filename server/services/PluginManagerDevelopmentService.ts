import fs from 'fs'
import { PluginEntity } from '@sidekick-coder/zenith-kit/server'
import PluginManagerService from './PluginManagerService.ts'

export default class PluginManagerDevelopmentService extends PluginManagerService {
    private async loadPlugin(id: string) {
        const plugin = this.pluginsDiscovered.get(id)

        if (!plugin) {
            this.logger.error(`plugin with id ${id} not found in discovered plugins`)
            return
        }

        if (!plugin.enabled) {
            return
        }

        const serverIndexPath = plugin.makePath('src', 'server', 'index.ts')

        if (!fs.existsSync(serverIndexPath)) {
            this.logger.error(`server index file not found for plugin ${id} at path ${serverIndexPath}`)
            return
        }

        let contructor = await import(serverIndexPath)

        contructor = contructor.default || contructor

        if (typeof contructor !== 'function') {
            this.logger.error(`default export of plugin ${id} is not a constructor function`)
            return
        }

        if (!contructor.fromPluginDiscoverEntity) {
            this.logger.error(`looks like plugin ${id} is not a instance of PluginEntity`)
            return
        }

        const instance: PluginEntity = contructor.fromPluginDiscoverEntity(plugin)

        this.pluginEntities.set(id, instance)

        if (this.debug) {
            this.logger.debug(`loaded plugin (${id} v${instance.version})`)
        }
    }

    public async load(): Promise<void> {
        for (const id of this.pluginsDiscovered.keys()) {
            await this.loadPlugin(id)
        }
    }
}
