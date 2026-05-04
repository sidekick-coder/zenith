import fs from 'fs'
import { PluginEntity, PluginEntryEntity } from '@sidekick-coder/zenith-kit/server'
import PluginManagerService from './PluginManagerService.ts'

export default class PluginManagerDevelopmentService extends PluginManagerService {
    private async loadPluginServerEntry(plugin: PluginEntryEntity) {
        const logger = this.logger.child({ pluginId: plugin.id })

        const entry = plugin.makePath('src', 'server', 'index.ts')

        if (!fs.existsSync(entry)) {
            logger.warn(`${plugin.id} server entry not found, skipping...`)
            return
        }

        let contructor = await import(entry)

        contructor = contructor.default || contructor

        if (typeof contructor !== 'function') {
            logger.error(`default export of plugin ${plugin.id} is not a constructor function`)
            return
        }

        if (!contructor.fromPluginDiscoverEntity) {
            logger.error(`looks like plugin ${plugin.id} is not a instance of PluginEntity`)
            return
        }

        const instance: PluginEntity = contructor.fromPluginDiscoverEntity(plugin)

        await instance.load()

        if (this.debug) {
            logger.debug(`loaded plugin (${plugin.id} v${instance.version})`)
        }
    }

    public async loadPluginClientEntry(plugin: PluginEntryEntity): Promise<void> {
        const logger = this.logger.child({ pluginId: plugin.id })

        const entry = plugin.makePath('src', 'client', 'index.ts')

        if (!fs.existsSync(entry)) {
            logger.warn(`${plugin.id} client entry not found, skipping...`)
            return
        }

    }

    public async load(): Promise<void> {
        const plugins = Array.from(this.entries.values()).filter(plugin => plugin.enabled)

        for (const plugin of plugins) {
            await this.loadPluginServerEntry(plugin)
            await this.loadPluginClientEntry(plugin)
        }
    }
}
