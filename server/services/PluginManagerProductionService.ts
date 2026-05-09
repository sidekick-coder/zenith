import fs from 'fs'
import path from 'path'
import express from 'express'
import { container, migrator, MigratorService, PluginEntity, PluginEntryEntity, SeederService } from '@sidekick-coder/zenith-kit/server'
import PluginManagerService from './PluginManagerService.ts'
import ExpressService from './express.service.ts'
import emmitter from '#server/facades/emmitter.facade.ts'
import { resolveHeadAssetsFromManifest } from '#server/utils/resolveHeadAssetsFromManifest.ts'
import seeder from '#server/facades/seeder.facade.ts'

export default class PluginManagerProductionService extends PluginManagerService {
    private async loadPluginSources(plugin: PluginEntity) {
        const logger = this.logger.child({ pluginId: plugin.id })

        if (container.has(MigratorService)) {
            migrator.addSource({
                id: plugin.id,
                directory: plugin.makePath('dist', 'server', 'migrations'),
            })

            if (this.debug) {
                logger.debug(`added plugin ${plugin.id} migrations to migrator`)
            }
        }

        if (container.has(SeederService)) {
            seeder.addSource({
                id: plugin.id,
                directory: plugin.makePath('dist', 'server', 'seeders'),
            })

            if (this.debug) {
                logger.debug(`added plugin ${plugin.id} seeders to seeder`)
            }
        }
    }

    private async loadPluginServerEntry(plugin: PluginEntryEntity) {
        const logger = this.logger.child({ pluginId: plugin.id })

        const entry = plugin.makePath('dist', 'server', 'index.mjs')

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

        this.loadPluginSources(instance)

        logger.info(`plugin loaded (${plugin.id} v${instance.version})`)
    }

    public async loadServerPLugins(): Promise<void> {
        const plugins = Array.from(this.entries.values()).filter(plugin => plugin.enabled)

        for (const plugin of plugins) {
            await this.loadPluginServerEntry(plugin)
        }
    }

    public async loadClientNodePLugins(): Promise<void> {
        const plugins = Array.from(this.entries.values()).filter(plugin => plugin.enabled)

        const entries = [] as any

        for (const plugin of plugins) {
            const logger = this.logger.child({ pluginId: plugin.id })

            const entry = plugin.makePath('dist', 'client-node', 'index.mjs')

            if (!fs.existsSync(entry)) {
                logger.warn(`${plugin.id} client node entry not found, skipping...`)
                return
            }

            const pluginEntry = {
                id: plugin.id,
                name: plugin.name,
                version: plugin.version,
                enabled: plugin.enabled,
                entry
            }

            entries.push(pluginEntry)

            if (this.debug) {
                logger.debug('load client-node plugin entry: ' + pluginEntry.id, { entry: pluginEntry })
            }
        }

        emmitter.on('page:request:start', c => c.setNodeContainerValue('plugin:entries', entries))
    }

    public async loadClientBrowserPlugins(): Promise<void> {
        const plugins = Array.from(this.entries.values()).filter(plugin => plugin.enabled)

        const entries = [] as any
        const links = [] as any
        const scripts = [] as any

        for (const plugin of plugins) {
            const logger = this.logger.child({ pluginId: plugin.id })

            const manifestPath = plugin.makePath('dist', 'client-browser', '.vite', 'manifest.json')

            if (!fs.existsSync(manifestPath)) {
                logger.warn(`${plugin.id} client browser manifest not found, skipping...`)
                return
            }

            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))

            const entry = manifest['src/client/index.ts']

            if (!entry) {
                logger.warn(`${plugin.id} client browser entry not found in manifest, skipping...`)
                return
            }

            const result = resolveHeadAssetsFromManifest({
                manifest,
                entry: 'src/client/index.ts',
                baseUrl: `/plugins/${plugin.id}/vendor`
            })

            // convert scripts to preload links 
            result.scripts.forEach((script: any) => {
                links.push({
                    rel: 'modulepreload',
                    href: script.src
                })
            })

            links.push(...result.links)

            // also add any css files to links
            Object.values(manifest).forEach((chunk: any) => {
                if (chunk.file.endsWith('.css')) {
                    links.push({
                        rel: 'stylesheet',
                        href: `/plugins/${plugin.id}/vendor/${chunk.file}`
                    })
                }
            })

            const pluginEntry = {
                id: plugin.id,
                name: plugin.name,
                version: plugin.version,
                enabled: plugin.enabled,
                entry: path.join('/plugins', plugin.id, 'vendor', entry.file)
            }

            entries.push(pluginEntry)

            if (container.has(ExpressService)) {
                const http = container.get<ExpressService>(ExpressService)

                http.use(`/plugins/${plugin.id}/vendor`, express.static(plugin.makePath('dist', 'client-browser')))
            }

            if (this.debug) {
                logger.debug('load client-browser plugin entry: ' + pluginEntry.id, { entry: pluginEntry })
            }

        }
        emmitter.on('page:request:before-render', c => {
            c.setBrowserContainerValue('plugin:entries', entries)

            c.head.push({
                link: links,
                script: scripts
            })
        })
    }



    public async load(): Promise<void> {
        await this.loadServerPLugins()
        await this.loadClientNodePLugins()
        await this.loadClientBrowserPlugins()
    }

    public async cleanup(): Promise<void> {
        // const files = await fs.promises.readdir(basePath('client/.plugins'))
        //
        // const plguinFiles = files.filter(file => file.endsWith('.ts'))
        //
        // for (const file of plguinFiles) {
        //     await fs.promises.unlink(basePath('client/.plugins', file))
        // }
    }
}
