import fs from 'fs'
import path from 'path'
import { config, GitGateway, PluginEntryEntity } from '@sidekick-coder/zenith-kit/server'
import { BaseException, LoggerService } from '@sidekick-coder/zenith-kit/shared'
import cosmicconfig from 'cosmiconfig'
import { tryCatch } from '#shared/utils/tryCatch.ts'

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
    public dirs: Set<string>
    public logger: LoggerService
    public debug = false

    constructor(options: PluginManagerServiceOptions) {
        this.logger = options.logger || new LoggerService()
        this.entries = new Map()
        this.dirs = new Set()
        this.debug = options.debug || false

        if (this.debug) {
            this.logger.debug('initialized in debug mode')
        }
    }

    public addDir(...dirs: string[]) {
        dirs.forEach(dir => this.dirs.add(dir))
    }

    public async load(): Promise<void> {
        throw new BaseException('Plugin loading not implemented yet')
    }

    private async registerPlugin(directory: string) {
        const pkg = {} as any
        const manifest = {} as any
        const pluginConfig = {} as any
        const git = {} as any

        if (fs.existsSync(path.join(directory, 'package.json'))) {
            const json = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf-8'))

            Object.assign(pkg, json)
        }

        if (fs.existsSync(path.join(directory, 'manifest.json'))) {
            const json = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf-8'))

            Object.assign(manifest, json)
        }

        const explorer = cosmicconfig.cosmiconfigSync('zenith', {
            searchPlaces: [
                'zenith.config.js',
                'zenith.config.yml',
                'zenith.config.yaml',
            ]
        })

        const result = explorer.search(directory)

        if (result && result.config) {
            Object.assign(pluginConfig, result.config)
        }

        if (!pluginConfig.id) {
            this.logger.error('plugin config must have an id', { directory })
            return
        }

        const gitGateay = new GitGateway({
            logger: this.logger.child({ plugin: pluginConfig.id }),
            cwd: directory,
        })

        const [error, gitInfo] = await tryCatch(() => gitGateay.getInfo())

        if (error) {
            this.logger.warn('failed to get git info for plugin', {
                directory,
                error 
            })
            return
        }

        const plugin = PluginEntryEntity.from({
            id: pluginConfig.id,
            aliases: pluginConfig.aliases || [],
            directory,
            name: manifest.name || pkg.name || pluginConfig.id,
            version: `${gitInfo?.head || 'unknown'}@${gitInfo?.shortHash || 'unknown'}`,
            enabled: config.get(`plugins.registry.${pluginConfig.id}.enabled`, false),
        })

        if (this.debug) {
            this.logger.debug(`discovered plugin ${plugin.name} (${plugin.id})`, {
                id: plugin.id,
                name: plugin.name,
                version: plugin.version,
                directory: plugin.directory,
            })
        }

        this.entries.set(pluginConfig.id, plugin)
    }

    public async register() {
        for (const directory of this.dirs.values()) {
            await this.registerPlugin(directory)
        }
    }

    public list() {
        return Array.from(this.entries.values())
    }

    public enable(id: string) {
        const plugin = this.findOrFail(id)

        config.set(`plugins.registry.${plugin.id}.enabled`, true)
    }

    public disable(id: string) {
        const plugin = this.findOrFail(id)

        config.set(`plugins.registry.${plugin.id}.enabled`, false)
    }

    public toggle(id: string) {
        if (config.get(`plugins.registry.${id}.enabled`)) {
            return this.disable(id)
        }

        return this.enable(id)
    }

    public find(idNameOrAlias: string) {
        const all = this.list()

        let search = all.find(p => p.id === idNameOrAlias)

        if (!search) {
            search = all.find(p => p.name === idNameOrAlias)
        }

        if (!search) {
            search = all.find(p => p.aliases?.includes(idNameOrAlias))
        }

        return search
    }

    public findOrFail(id: string) {
        const plugin = this.find(id)

        if (!plugin) {
            throw new BaseException(`Plugin "${id}" not found`)
        }

        return plugin
    }
}
