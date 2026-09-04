import fs from 'fs'
import path from 'path'
import { basePath } from '@sidekick-coder/zenith-kit/server/utils/basePath'
import EnvService from '@sidekick-coder/zenith-kit/server/services/EnvService'
import { GitGateway } from '@sidekick-coder/zenith-kit/server/gateways/GitGateway'
import PluginEntryEntity from '@sidekick-coder/zenith-kit/server/entities/PluginEntryEntity'
import ShellService from '@sidekick-coder/zenith-kit/server/services/ShellService'
import BaseException from '@sidekick-coder/zenith-kit/shared/exceptions/BaseException'
import ConfigService from '@sidekick-coder/zenith-kit/shared/services/ConfigService'
import LoggerService from '@sidekick-coder/zenith-kit/shared/services/LoggerService'
import cosmicconfig from 'cosmiconfig'
import type PluginLoaderService from './PluginLoaderService.ts'
// import PluginLoaderDevelopmentService from './PluginLoaderDevelopmentService.ts'
// import PluginLoaderProductionService from './PluginLoaderProductionService.ts'

export interface PluginManagerServiceOptions {
    logger?: LoggerService
    env?: EnvService
    debug?: boolean
    config?: ConfigService
}


export default class PluginManagerService {
    public static __container_entry_key = 'PluginManagerService'
    public entries: Map<string, PluginEntryEntity>
    public logger: LoggerService
    public debug = false
    public env: EnvService
    public config: ConfigService
    public shell: ShellService
    public dirs: Set<string>

    constructor(options: PluginManagerServiceOptions) {
        this.logger = options.logger || new LoggerService()
        this.entries = new Map()
        this.debug = options.debug || false
        this.env = options.env || new EnvService()
        this.config = options.config || new ConfigService()
        this.shell = new ShellService({
            logger: this.logger.child({ label: 'plugin.shell' }),
            debug: this.debug
        })
        this.dirs = new Set()

        if (this.debug) {
            this.logger.debug('initialized in debug mode')
        }
    }

    public static create(options: PluginManagerServiceOptions = {}) {
        return new PluginManagerService(options)
    }

    public setEnv(env: EnvService) {
        this.env = env
        return this
    }

    public setLogger(logger: LoggerService) {
        this.logger = logger
        return this
    }

    public setConfig(config: ConfigService) {
        this.config = config
        return this
    }

    public setDebug(debug: boolean) {
        this.debug = debug
        return this
    }

    private async loadPluginDir(directory: string) {
        const pkg = {} as any
        const pluginConfig = {} as any

        if (fs.existsSync(path.join(directory, 'package.json'))) {
            const json = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf-8'))

            Object.assign(pkg, json)
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

        const [error, gitInfo] = await $try(() => gitGateay.getInfo())

        if (error) {
            this.logger.warn('failed to get git info for plugin', {
                directory,
                error
            })
            return
        }

        const version_channel = this.config.get(`plugins.registry.${pluginConfig.id}.version_channel`, 'commits')
        const version = `${version_channel}@${gitInfo.shortHash}`

        const plugin = PluginEntryEntity.from({
            id: pluginConfig.id,
            aliases: pluginConfig.aliases || [],
            directory,
            name: pluginConfig.name || pkg.name || pluginConfig.id || 'unknown',
            version,
            version_channel,
            version_available_channels: pluginConfig.version_available_channels || ['branch:main'],
            enabled: this.config.get(`plugins.registry.${pluginConfig.id}.enabled`, false),
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

    public async downloadPlugin(item: any) {
        const repository = item.repository
        const destination = item.destination
        const sshKeyFile = item.ssh_key_file
        const sshKey = item.ssh_key

        if (!repository || !destination) {
            this.logger.error('invalid plugin download entry', { item })
            return
        }

        const exists = fs.existsSync(destination)

        if (exists && this.debug) {
            this.logger.debug('plugin destination already exists, skipping download', item)
        }

        if (exists) {
            this.dirs.add(destination)
            return
        }

        const git = await GitGateway.clone(repository, destination, {
            logger: this.logger.child({ label: 'plugin.git' }),
            shell: this.shell,
            debug: this.debug,
            sshKeyFile: sshKeyFile,
            sshKey: sshKey,
        })

        await git.fetchAll()

        this.logger.info('downloaded plugin', {
            repository,
            destination,
        })

        this.dirs.add(destination)
    }

    public async downloadPendingPlugins() {
        const dowloads = this.config.get<string[]>('plugins.downloads', [])

        for (const item of dowloads) {
            await this.downloadPlugin(item)
        }
    }

    public async loadEntries(): Promise<void> {
        for (const dir of this.dirs) {
            await this.loadPluginDir(dir)
        }
    }

    public async loadDirsFromRoot() {
        const entries = await fs.promises.readdir(basePath('plugins'), { withFileTypes: true })

        for await (const entry of entries) {
            if (entry.isDirectory()) {
                this.dirs.add(path.join(basePath('plugins'), entry.name))
            }
        }
    }

    public async loadDirsFromConfig() {
        const entries = this.config.get<string[]>('plugins.dirs', [])

        for (const dir of entries) {
            this.dirs.add(dir)
        }
    }

    public async loadDirsFromEnv() {
        const entries = this.env.get('ZENITH_PLUGINS_DIR', [])

        for (const dir of entries) {
            this.dirs.add(dir)
        }
    }

    public async load() {
        await this.loadDirsFromRoot()
        await this.loadDirsFromConfig()
        await this.loadDirsFromEnv()

        await this.downloadPendingPlugins()

        await this.loadEntries()

        let loader: PluginLoaderService | null = null

        if (this.env.development || this.env.test) {
            const { default: PluginLoaderDevelopmentService } = await import('./PluginLoaderDevelopmentService.ts')

            loader = new PluginLoaderDevelopmentService()
        }

        if (this.env.production) {
            const { default: PluginLoaderProductionService } = await import('./PluginLoaderProductionService.ts')

            loader = new PluginLoaderProductionService()
        }

        if (!loader) {
            throw new BaseException(`Failed to initialize PluginManagerService in ${this.env.get('NODE_ENV')} environment`)
        }

        await loader
            .setLogger(this.logger.child({ label: 'plugin.loader' }))
            .setDebug(this.debug)
            .setEntries(this.entries)
            .load()

        return this
    }

    public list() {
        return Array.from(this.entries.values())
    }

    public enable(id: string) {
        const plugin = this.findOrFail(id)

        this.config.set(`plugins.registry.${plugin.id}.enabled`, true)
    }

    public disable(id: string) {
        const plugin = this.findOrFail(id)

        this.config.set(`plugins.registry.${plugin.id}.enabled`, false)
    }

    public toggle(id: string) {
        if (this.config.get(`plugins.registry.${id}.enabled`)) {
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
