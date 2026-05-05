import fs from 'fs'
import path from 'path'
import { config, PluginEntryEntity } from '@sidekick-coder/zenith-kit/server'
import { BaseException, LoggerService } from '@sidekick-coder/zenith-kit/shared'

export interface PluginDefinition {
    id: string
    directory: string
}

export interface PluginManagerServiceOptions {
    logger?: LoggerService
    debug?: boolean
}


export default class PluginManagerService {
    public static __container_entry_key = 'PluginManagerService'
    public entries: Map<string, PluginEntryEntity>
    public dirs: Map<string, string>
    public logger: LoggerService
    public debug = false

    constructor(options: PluginManagerServiceOptions) {
        this.logger = options.logger || new LoggerService()
        this.entries = new Map()
        this.dirs = new Map()
        this.debug = options.debug || false

        if (this.debug) {
            this.logger.debug('initialized in debug mode')
        }
    }

    public addDir(pluginId: string, directory: string) {
        this.dirs.set(pluginId, directory)
    }

    public async load(): Promise<void> {
        throw new BaseException('Plugin loading not implemented yet')
    }

    private async registerPlugin(id: string, directory: string) {
        let pkg = {} as any
        let manifest = {} as any

        if (fs.existsSync(path.join(directory, 'package.json'))) {
            pkg = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf-8'))
        }

        if (fs.existsSync(path.join(directory, 'manifest.json'))) {
            manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf-8'))
        }

        const plugin = PluginEntryEntity.from({
            id,
            directory,
            name: manifest.name || pkg.name || id,
            version: manifest.version || pkg.version || '0.0.0',
            enabled: config.get(`plugins.${id}.enabled`, false),
        })

        if (this.debug) {
            this.logger.debug(`discovered plugin ${id}`, plugin)
        }

        this.entries.set(id, plugin)
    }

    public async register() {
        for (const [id, directory] of this.dirs.entries()) {
            await this.registerPlugin(id, directory)
        }
    }
}
