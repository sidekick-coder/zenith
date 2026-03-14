import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import ModuleInstallerService from './moduleInstaller.service.ts'
import ModuleUpgraderService from './moduleUpgrader.service.ts'
import ModuleBuilderService from './moduleBuilder.service.ts'
import ModuleHooksService from './moduleHooks.service.ts'
import config from '#server/facades/config.facade.ts'
import { basePath } from '#server/utils/paths.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import Module from '#server/entities/module.entity.ts'
import logger from '#server/facades/logger.facade.ts'
import ModuleManifest from '#shared/entities/moduleManifest.entity.ts'
import type LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import env from '#server/facades/env.facade.ts'

interface UninstallOptions {
    rollback?: boolean
}
interface ListOptions {
    enabled?: boolean;
}

interface Manifest {
    name: string
    version: string
    description?: string
    author?: string
    dependencies?: Record<string, string>
}

export default class ModulesService {
    public installer: ModuleInstallerService
    public upgrader: ModuleUpgraderService
    public builder: ModuleBuilderService
    public hooks: ModuleHooksService
    public manifests: Map<string, ModuleManifest>
    public mods: (Module & LifecycleHook)[] = []
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
        const folder = basePath('modules')
        const dirs = await fs.promises.readdir(folder, { withFileTypes: true })
        
        const moduleNames = dirs
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)

        for (const name of moduleNames) {
            const manifestPath = path.join(folder, name, 'module.json')

            if (!fs.existsSync(manifestPath)) {
                this.logger.warn(`No manifest found for module '${name}', skipping`)
                continue
            }

            const [error, json] =  await tryCatch(async () => {
                const text = await fs.promises.readFile(manifestPath, 'utf-8')

                return JSON.parse(text) as Manifest
            })

            if (error) {
                this.logger.error(`Failed to read manifest for module '${name}'`, error)
                continue
            }

            this.manifests.set(name, ModuleManifest.from({
                id: name,
                name: json.name,
                version: json.version,
                description: json.description,
                enabled: config.get(`modules.enabled.${name}`, false),
                dependencies: json.dependencies || {}
            }))

            if (this.debug) {
                this.logger.debug(`discovered module '${name}'`, json)
            }
        }

        if (this.debug) {
            this.logger.debug(`Discovered ${this.manifests.size} modules`, {
                modules: Array.from(this.manifests.keys())
            })
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

    public async loadModulesInstances(){
        this.mods = []

        const manifests = this.getManifestSortedByDependency()
        
        for (const manifest of manifests) {
            if (!manifest.enabled) {
                continue
            }
        
            const file = path.join(basePath('modules'), manifest.id, 'server/module.server.ts')
        
            if (!await fs.promises.stat(file).catch(() => false)) {

                if (this.debug) {
                    this.logger.debug(`No server module file found for '${manifest.id}', skipping`)
                }

                continue
            }

            const url = pathToFileURL(file)

            if (!env.production) {
                url.searchParams.set('t', Date.now().toString())
            }

            const [error, ModClass] = await tryCatch(() => import(url.href).then(m => m.default || m))

            if (error) {
                this.logger.error(`Failed to import module class for '${manifest.id}'`, error)
                continue
            }

            if (ModClass.prototype instanceof Module === false) {
                this.logger.error(`Module class for '${manifest.id}' does not extend Module base class`)
                continue
            }

            const modInstance = new ModClass() as Module

            modInstance.setData(manifest)

            this.mods.push(modInstance)
        }

        if (this.debug) {
            this.logger.debug(`Loaded ${this.mods.length} modules`, {
                modules: this.mods.map(m => m.id)
            })
        }
    }

    public async list(options: ListOptions = {}) {
        const modulesPath = basePath('modules')
        const moduleNames = fs.readdirSync(modulesPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)

        let items = [] as Module[]

        for (const name of moduleNames) {
            const mod = Module.from({
                id: name,
                name: name,
                enabled: config.get(`modules.enabled.${name}`, false),
            })

            items.push(mod)
        }

        if (options?.enabled) {
            items = items.filter(mod => mod.enabled)
        }

        for (const mod of items) {
            await mod.load()
        }

        return items
    }

    public async find(moduleName: string) {
        const allModules = await this.list()

        const mod = allModules.find(mod => mod.name === moduleName)

        return mod || null
    }

    public async findOrFail(moduleName: string) {
        const mod = await this.find(moduleName)

        if (!mod) {
            throw new Error(`Module ${moduleName} not found`)
        }

        return mod
    }

    public async enable(moduleName: string) {
        const mod = await this.find(moduleName)

        await this.prepare(moduleName)

        if (!mod) {
            throw new Error(`Module ${moduleName} not found`)
        }

        if (mod.enabled) {
            logger.debug(`Module ${moduleName} is already enabled`)
            return
        }

        config.set(`modules.enabled.${moduleName}`, true)

        logger.info(`module ${moduleName} enabled`)
    }

    public async disable(moduleName: string) {
        const mod = await this.findOrFail(moduleName)

        if (!mod.enabled) {
            logger.info(`Module ${moduleName} is already disabled`)
            return
        }

        config.set(`modules.enabled.${moduleName}`, false)

        logger.info(`module ${moduleName} disabled`)
    }

    public async toggle(moduleName: string) {
        if (config.get(`modules.enabled.${moduleName}`)) {
            return this.disable(moduleName)
        }

        return await this.enable(moduleName)
    }

    public async prepare(moduleName: string) {
        const mod = await this.findOrFail(moduleName)
        const rootDir = mod.makePath('root')

        // Check if root directory exists
        if (!fs.existsSync(rootDir)) {
            fs.mkdirSync(rootDir, { recursive: true })
        }

        if (this.debug) {
            logger.debug(`preparing symlinks for module '${moduleName}'`)
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
            logger.debug(`Symlinks prepared for module '${moduleName}'`)
        }

    }

    public async uninstall(moduleName: string, options: UninstallOptions = {}) {
        const mod = await this.findOrFail(moduleName)
        const moduleDir = mod.makePath()

        logger.info(`uninstalling module '${moduleName}'`)

        // Remove module folder        
        fs.rmSync(moduleDir, { 
            recursive: true, 
            force: true 
        })

        logger.info(`'${moduleName}' uninstalled successfully`)
    }
}