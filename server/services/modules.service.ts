import fs from 'fs'
import path from 'path'
import { ModuleEntity, basePath } from '@sidekick-coder/zenith-kit/server'
import { BaseException } from '@sidekick-coder/zenith-kit/shared'
import ModuleInstallerService from './moduleInstaller.service.ts'
import ModuleUpgraderService from './moduleUpgrader.service.ts'
import ModuleBuilderService from './moduleBuilder.service.ts'
import ModuleHooksService from './moduleHooks.service.ts'
import config from '#server/facades/config.facade.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import logger from '#server/facades/logger.facade.ts'
import ModuleManifest from '#shared/entities/moduleManifest.entity.ts'
import type LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import env from '#server/facades/env.facade.ts'
import { importOne } from '#server/utils/importOne.ts'

interface ListOptions {
    enabled?: boolean;
}

interface Manifest {
    name: string
    version: string
    description?: string
    author?: string
    dependencies?: Record<string, string>
    directory: string
}

export default class ModulesService {
    public static __container_entry_key = 'ModulesService'

    public installer: ModuleInstallerService
    public upgrader: ModuleUpgraderService
    public builder: ModuleBuilderService
    public hooks: ModuleHooksService
    public manifests: Map<string, ModuleManifest>
    public mods: (ModuleEntity & LifecycleHook)[] = []
    public logger = logger.child({ label: 'modules' })
    public debug = false

    public init(data: Partial<ModulesService> = {}) {
        this.manifests = data.manifests || new Map<string, ModuleManifest>()
        this.logger = data.logger || logger.child({ label: 'modules' })
        this.debug = data.debug || false

        this.installer = data.installer || new ModuleInstallerService()
        this.upgrader = data.upgrader || new ModuleUpgraderService()
        this.builder = data.builder || new ModuleBuilderService()
        this.hooks = data.hooks || new ModuleHooksService({
            manifests: this.manifests,
            logger: this.logger,
            debug: this.debug,
        })
    }

    public async discover() {
        const entries = [] as { id: string, directory: string }[]

        for (const dirent of fs.readdirSync(basePath('modules'), { withFileTypes: true })) {
            if (!dirent.isDirectory()) {
                continue
            }

            const id = dirent.name
            const directory = basePath('modules', id)

            entries.push({
                id,
                directory
            })

        }

        for (const e of Object.values<any>(env.get('ZENITH_MODULE_EXTRAS', {}))) {
            const id = e.id
            const directory = e.directory

            if (!id || !directory) {
                this.logger.warn('Invalid extra module entry, missing id or directory, skipping', e)
                continue
            }

            if (!fs.existsSync(directory)) {
                this.logger.warn(`Extra module directory '${directory}' does not exist, skipping`, e)
                continue
            }

            entries.push({
                id,
                directory
            })
        }

        for (const entry of entries) {
            const manifestPath = path.join(entry.directory, 'module.json')
            const id = entry.id

            if (!fs.existsSync(manifestPath)) {
                this.logger.warn(`No manifest found for module '${id}', skipping`)
                continue
            }

            const [error, json] = await tryCatch(async () => {
                const text = await fs.promises.readFile(manifestPath, 'utf-8')

                return JSON.parse(text) as Manifest
            })

            if (error) {
                this.logger.error(`Failed to read manifest for module '${id}'`, error)
                continue
            }

            this.manifests.set(id, ModuleManifest.from({
                ...json,
                id: id,
                enabled: config.get(`modules.${id}.enabled`, false),
                directory: entry.directory,
            }))

            if (this.debug) {
                this.logger.debug(`discovered module '${id}'`, json)
            }
        }

        if (this.debug) {
            this.logger.debug(`Discovered ${this.manifests.size} modules`, { modules: Array.from(this.manifests.keys()) })
        }
    }

    public getManifestSortedByDependency(): ModuleManifest[] {
        const manifests = Array.from(this.manifests.values())
        const map = new Map(manifests.map(m => [m.id, m]))
        const visited = new Set<string>()
        const sorted: ModuleManifest[] = []

        const visit = (m: ModuleManifest) => {
            if (visited.has(m.id)) return
            visited.add(m.id)

            for (const dep of Object.keys(m.dependencies || {})) {
                const depManifest = map.get(dep)
                if (depManifest) {
                    visit(depManifest)
                }
            }

            sorted.push(m)
        }

        for (const m of manifests) {
            visit(m)
        }

        return sorted
    }

    public async loadModulesInstances() {
        this.mods = []

        const manifests = this.getManifestSortedByDependency()

        for (const manifest of manifests) {
            if (!manifest.enabled) {
                continue
            }

            const file = path.join(basePath('modules'), manifest.id, 'server/module.server.ts')



            const filenames = [
                path.join(manifest.directory, 'server/module.server.ts'),
                path.join(manifest.directory, 'server/module.server.js'),
                path.join(manifest.directory, 'server/index.ts'),
                path.join(manifest.directory, 'server/index.js'),
                path.join(manifest.directory, 'server/server.ts'),
                path.join(manifest.directory, 'server/server.js'),
            ]

            const [error, ModClass] = await tryCatch(async () => {
                const mod = await importOne(filenames)

                return mod?.default || mod
            })

            if (error) {
                this.logger.error(`Failed to import module class for '${manifest.id}'`, error)
                continue
            }

            if (!ModClass) {
                this.logger.warn(`No server module file found for '${manifest.id}', skipping...`, { files: filenames })
                continue
            }

            if (ModClass.prototype instanceof ModuleEntity === false) {
                this.logger.error(`Module class for '${manifest.id}' does not extend Module base class`)
                continue
            }

            const modInstance = new ModClass() as ModuleEntity

            modInstance.setData(manifest)

            this.mods.push(modInstance)
        }

        if (this.debug) {
            this.logger.debug(`Loaded ${this.mods.length} modules`, { modules: this.mods.map(m => m.id) })
        }
    }

    public async list(options: ListOptions = {}) {
        let manifests = Array.from(this.manifests.values())

        if (options.enabled !== undefined) {
            manifests = manifests.filter(mod => mod.enabled === options.enabled)
        }

        const mods = manifests.map(manifest => {
            const mod = new ModuleEntity()

            mod.setData(manifest)

            return mod
        })

        return mods
    }

    public async find(id: string) {
        const manifest = this.manifests.get(id)

        if (!manifest) {
            return null
        }

        const mod = new ModuleEntity()

        mod.setData(manifest)

        return mod
    }

    public async findOrFail(id: string) {
        const mod = await this.find(id)

        if (!mod) {
            throw new Error(`Module ${id} not found`)
        }

        return mod
    }

    public async enable(id: string) {
        const mod = await this.find(id)

        // await this.prepare(id)

        if (!mod) {
            throw new Error(`Module ${id} not found`)
        }

        if (mod.enabled) {
            logger.debug(`Module ${id} is already enabled`)
            return
        }

        config.set(`modules.${id}.enabled`, true)

        logger.info(`module ${id} enabled`)
    }

    public async disable(id: string) {
        const mod = await this.findOrFail(id)

        if (!mod.enabled) {
            logger.info(`Module ${id} is already disabled`)
            return
        }

        config.set(`modules.${id}.enabled`, false)

        logger.info(`module ${id} disabled`)
    }

    public async toggle(id: string) {
        if (config.get(`modules.${id}.enabled`)) {
            return this.disable(id)
        }

        return await this.enable(id)
    }

    public async prepare(id: string) {
        const mod = await this.findOrFail(id)
        const rootDir = mod.makePath('root')

        // Check if root directory exists
        if (!fs.existsSync(rootDir)) {
            fs.mkdirSync(rootDir, { recursive: true })
        }

        if (this.debug) {
            logger.debug(`preparing symlinks for module '${id}'`)
        }


        const symlinks = [
            {
                source: basePath('server'),
                target: path.join(rootDir, 'server')
            },
            {
                source: basePath('shared'),
                target: path.join(rootDir, 'shared')
            },
            {
                source: basePath('client'),
                target: path.join(rootDir, 'client')
            },
            {
                source: basePath('.ai'),
                target: path.join(rootDir, '.ai')
            },
            {
                source: basePath('arte'),
                target: mod.makePath('arte')
            },
        ]

        for (const dependency of Object.keys(mod.dependencies || {})) {
            symlinks.push(
                {
                    source: basePath('modules', dependency, 'server'),
                    target: path.join(rootDir, 'modules', dependency, 'server')
                },
                {
                    source: basePath('modules', dependency, 'shared'),
                    target: path.join(rootDir, 'modules', dependency, 'shared')
                },
                {
                    source: basePath('modules', dependency, 'client'),
                    target: path.join(rootDir, 'modules', dependency, 'client')
                },
            )
        }



        for (const { source, target } of symlinks) {
            if (fs.existsSync(target)) {

                if (this.debug) {
                    logger.debug(`Target directory '${path.relative(basePath(), target)}' exist, skipping symlink`)
                }

                continue
            }

            if (!fs.existsSync(source)) {
                logger.warn(`Source directory '${path.relative(basePath(), source)}' does not exist, skipping symlink`)

                continue
            }

            // Create symlink
            const [symlinkError] = await tryCatch(() => {
                const dir = path.dirname(target)

                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true })
                }

                fs.symlinkSync(source, target, 'dir')
            })

            if (symlinkError) {
                logger.error(`Failed to create symlink ${path.relative(basePath(), source)} -> ${path.relative(basePath(), target)}`)
                throw new Error(`Failed to create symlink: ${symlinkError.message}`)
            }

            if (this.debug) {
                logger.debug(`created symlink: ${path.basename(source)} -> ${target}`)
            }

        }

        if (this.debug) {
            logger.debug(`Symlinks prepared for module '${id}'`)
        }

    }

    public async uninstall(id: string) {
        const mod = await this.findOrFail(id)

        if (!mod.directory.startsWith(basePath('modules'))) {
            throw new BaseException('Only modules installed in the main modules directory can be uninstalled', 400)
        }

        logger.info(`uninstalling module '${id}'`)

        // Remove module folder        
        fs.rmSync(mod.directory, {
            recursive: true,
            force: true
        })

        logger.info(`'${id}' uninstalled successfully`)
    }
}
