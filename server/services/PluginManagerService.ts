import fs from 'fs'
import path from 'path'
import { config, PluginDiscoverEntity, PluginEntity } from '@sidekick-coder/zenith-kit/server'
import { BaseException, LoggerService } from '@sidekick-coder/zenith-kit/shared'

export interface PluginDefinition {
    id: string
    directory: string
}

interface PluginManagerServiceOptions {
    logger?: LoggerService
    debug?: boolean
}


export default class PluginManagerService {
    public static __container_entry_key = 'PluginManagerService'
    public pluginsDiscovered: Map<string, PluginDiscoverEntity >
    public pluginDirs: Map<string, string>
    public pluginEntities: Map<string, PluginEntity>
    public logger: LoggerService
    public debug = false

    constructor(options: PluginManagerServiceOptions) {
        this.logger = options.logger || new LoggerService()
        this.pluginsDiscovered = new Map()
        this.pluginDirs = new Map()
        this.pluginEntities = new Map()
        this.debug = options.debug || false

        if (this.debug) {
            this.logger.debug('initialized in debug mode')
        }
    }

    public addPluginDir(pluginId: string, directory: string) {
        this.pluginDirs.set(pluginId, directory)
    }

    public async load(): Promise<void> {
        throw new BaseException('Plugin loading not implemented yet')
    }

    private async discoverPlugin(id: string, directory: string) {
        let pkg = {} as any
        let manifest = {} as any

        if (fs.existsSync(path.join(directory, 'package.json'))) {
            pkg = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf-8'))
        }

        if (fs.existsSync(path.join(directory, 'manifest.json'))) {
            manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf-8'))
        }

        const plugin = PluginDiscoverEntity.from({
            id,
            directory,
            name: manifest.name || pkg.name || id,
            version: manifest.version || pkg.version || '0.0.0',
            enabled: config.get(`plugins.${id}.enabled`, false),
        })

        if (this.debug) {
            this.logger.debug(`discovered plugin ${id}`, plugin)
        }

        this.pluginsDiscovered.set(id, plugin)
    }

    public async discover() {
        for (const [id, directory] of this.pluginDirs.entries()) {
            await this.discoverPlugin(id, directory)
        }
    }

    private async bootPlugin(plugin: PluginEntity) {
        await plugin.load()

        this.logger.info(`booted plugin ${plugin.id}`)
    }

    public async boot() {
        for (const plugin of this.pluginEntities.values()) {
            await this.bootPlugin(plugin)
        }

        if (this.debug) {
            this.logger.debug(`booted ${this.pluginEntities.size} plugins`)
        }
    }
}
