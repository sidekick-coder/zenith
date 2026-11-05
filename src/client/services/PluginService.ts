import { container, logger } from '@sidekick-coder/zenith-kit/client'
import { LoggerService } from '@sidekick-coder/zenith-kit/shared'

export default class PluginService {
    public debug: boolean 
    public logger: LoggerService

    constructor() {
        this.logger = new LoggerService()
        this.debug = false
    }

    public static create() {
        return new PluginService()
    }

    public setLogger(logger: LoggerService) {
        this.logger = logger

        return this
    }

    public setDebug(debug: boolean) {
        this.debug = debug

        return this
    }

    public async loadPluginEntry(fn: () => Promise<any>, plugin: any) {
        const file = await fn()

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
            logger.warn('plugin wihout a load function, skipping...', { pluginId: plugin.id })
            return null
        }

        await load()

        if (this.debug) {
            logger.debug(`plugin loaded ${plugin.name}(${plugin.id})`, {
                pluginId: plugin.id,
                developmentMode: plugin.developmentMode 
            })
        }
    }

    public async loadNodeSide() {
        const { pathToFileURL } = await import('url')

        const entries = container.get<any[]>('plugin:entries')

        for await (const e of entries) {
            const url = pathToFileURL(e.entry)

            const fn = () => import(/* @vite-ignore */ url.href)

            await this.loadPluginEntry(fn, e)
        }

    }

    public async loadBrowserSide() {
        const entries = container.get<any[]>('plugin:entries')

        for await (const e of entries) {
            const url = new URL(e.entry, window.location.origin)

            const fn = () => import(/* @vite-ignore */ url.toString())

            await this.loadPluginEntry(fn, e)
        }
    }

    public async load() {

        if (import.meta.env.SSR) {
            await this.loadNodeSide()
        }

        if (!import.meta.env.SSR) {
            await this.loadBrowserSide()
        }

    }
}
