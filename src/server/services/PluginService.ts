import fs from 'fs'
import { pathToFileURL } from 'url'
import path from 'path'
import { PluginService as BasePluginService, clientPath, config, dataPath, emmitter, env, PluginEntity } from '@sidekick-coder/zenith-kit/server'

export default class PluginService extends BasePluginService {
    public async registerDirsFromRoot() {
        const folder = dataPath('plugins')

        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true })
        }

        const entries = await fs.promises.readdir(folder, { withFileTypes: true })

        for await (const entry of entries) {
            if (entry.isDirectory()) {
                this.repository.addDirectory(path.join(folder, entry.name))
            }
        }
    }

    public async registerDirsFromConfig() {
        const entries = config.get<string[]>('plugins.dirs', [])

        for (const dir of entries) {
            this.repository.addDirectory(dir)
        }
    }

    public async registerDirsFromEnv() {
        const entries = env.get('ZENITH_PLUGINS_DIR', [])

        for (const dir of entries) {
            this.repository.addDirectory(dir)
        }
    }

    public async register(){
        await this.registerDirsFromRoot()
        await this.registerDirsFromConfig()
        await this.registerDirsFromEnv()
    }

    public async getPluginManifest(plugin: PluginEntity) {
        const manifestPath = plugin.makePath('dist', 'client-browser', '.vite', 'manifest.json')

        if (!fs.existsSync(manifestPath)) {
            return null
        }

        return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
    }

    public async loadPluginServerEntry(plugin: PluginEntity) {
        let filename = plugin.makePath('dist', 'server', 'index.mjs')

        if (plugin.developmentMode) {
            filename = plugin.makePath('src', 'server', 'index.ts')
        }

        if (!fs.existsSync(filename)) {
            this.logger.warn('plugin server entry not found, skipping...', { pluginId: plugin.id })
            return
        }

        const url = pathToFileURL(filename).href

        const file = await import(url)

        let load: (() => Promise<void>) | null = null

        const mod = file.default || file

        // if using definePlugin fn
        if (typeof mod === 'object' || typeof mod.load === 'function') {
            load = mod.load.bind(mod)
        }

        // if using Plugin class constructor
        if (typeof mod === 'function') {
            const instance = new mod()

            if (typeof instance.load === 'function') {
                load = instance.load.bind(instance)
            }
        }

        if (!load) {
            this.logger.warn('plugin wihout a load function, skipping...', { pluginId: plugin.id })
            return null
        }

        await load()

        this.logger.info(`plugin loaded ${plugin.name}(${plugin.id})`, {
            pluginId: plugin.id,
            directory: plugin.directory
        })
    }


    public async loadPluginClientEntryDevelopmentMode(plugin: PluginEntity) {
        const entry = plugin.makePath('src', 'client', 'index.ts')
        const filename = clientPath('.plugins', `${plugin.id}.ts`)

        if (fs.existsSync(filename)) {
            return
        }

        if (!fs.existsSync(entry)) {
            this.logger.warn('plugin client entry not found, skipping...', { pluginId: plugin.id })
            return
        }

        let content = `const fn = async () => import('${entry}')\n\n`

        content += 'export default fn\n\n'

        fs.writeFileSync(filename, content)
    }

    public async loadPluginClientEntry(plugin: PluginEntity) {
        if (plugin.developmentMode) {
            await this.loadPluginClientEntryDevelopmentMode(plugin)
            return
        }
    }

    public enable(id: string) {
        config.set(`plugins.registry.${id}.enabled`, true)
    }

    public disable(id: string) {
        config.set(`plugins.registry.${id}.enabled`, false)
    }

    public toggle(id: string) {
        if (config.get(`plugins.registry.${id}.enabled`)) {
            return this.disable(id)
        }

        return this.enable(id)
    }

    public async load() {
        await this.register()
        // implement on parent
        const plugins = await this.repository.findMany({ enabled: true })
        const entries = [] as any

        for await (const plugin of plugins) {
            await this.loadPluginServerEntry(plugin)

            entries.push({
                id: plugin.id,
                name: plugin.name,
                version: plugin.version,
                enabled: plugin.enabled,
                developmentMode: plugin.developmentMode,
            })
        }

        emmitter.on('page:request:start', c => c.setNodeContainerValue('plugin:entries', entries))
    }
}
