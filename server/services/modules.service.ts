import fs from 'fs'
import path from 'path'
import ModuleInstallerService from './moduleInstaller.service.ts'
import ModuleUpgraderService from './moduleUpgrader.service.ts'
import ModuleBuilderService from './moduleBuilder.service.ts'
import ModuleHooksService from './moduleHooks.service.ts'
import config from '#server/facades/config.facade.ts'
import { basePath } from '#server/utils/paths.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import Module from '#server/entities/module.entity.ts'
import type { ServerSetup, SetupServerParams } from '#server/utils/defineServerSetup.ts'
import logger from '#server/facades/logger.facade.ts'
import ModuleManifest from '#shared/entities/moduleManifest.entity.ts'

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
    public logger = logger.child({ label: 'modules' })
    public debug = false

    constructor(data: Partial<ModulesService> = {}) {
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
            }))

            if (this.debug) {
                this.logger.debug(`discovered module '${name}'`, json)
            }
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

        logger.info(`Preparing symlinks for module '${moduleName}'`)

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
                logger.debug(`Target directory '${path.relative(basePath(), target)}' exist, skipping symlink`)
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

            logger.debug(`Created symlink: ${path.basename(source)} -> ${target}`)
        }

        logger.info(`Symlinks prepared for module '${moduleName}'`)
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

    public async installDependencies(moduleName: string) {
        const mod = await this.findOrFail(moduleName)
        const moduleDir = mod.makePath()
        
        logger.info(`Installing dependencies for module '${moduleName}'`)

        const { spawn } = await import('child_process')
        
        return new Promise((resolve, reject) => {
            const child = spawn('npm', ['install'], {
                cwd: moduleDir,
                stdio: 'pipe'
            })
            
            let stdout = ''
            let stderr = ''
            
            child.stdout?.on('data', (data) => {
                stdout += data.toString()
            })
            
            child.stderr?.on('data', (data) => {
                stderr += data.toString()
            })
            
            child.on('close', (code) => {
                if (code === 0) {
                    logger.info(`Dependencies installed successfully for module '${moduleName}'`)
                    resolve(stdout)
                } else {
                    logger.error(`Failed to install dependencies for module '${moduleName}': ${stderr}`)
                    reject(new Error(`npm install failed with code ${code}: ${stderr}`))
                }
            })
            
            child.on('error', (error) => {
                logger.error(`Failed to spawn npm install for module '${moduleName}': ${error.message}`)
                reject(error)
            })
        })
    }

    public async runSeeds(moduleName: string) {
        const mod = await this.findOrFail(moduleName)
        
        logger.info(`Running seeds for module '${moduleName}'`)

        const seedsPath = mod.makePath('server', 'seeds')
        
        if (!fs.existsSync(seedsPath)) {
            logger.info(`No seeds directory found for module '${moduleName}'`)
            return { message: 'No seeds directory found' }
        }

        const seedFiles = fs.readdirSync(seedsPath)
            .filter(file => file.match(/\.(ts|js)$/))
            .sort()

        if (seedFiles.length === 0) {
            logger.info(`No seed files found for module '${moduleName}'`)
            return { message: 'No seed files found' }
        }

        const results = []
        
        // Import database facade for seed execution
        const db = await import('#server/facades/db.facade.ts').then(m => m.default)
        
        for (const seedFile of seedFiles) {
            const seedPath = path.join(seedsPath, seedFile)
            const seedName = path.basename(seedFile, path.extname(seedFile))
            
            const [error] = await tryCatch(async () => {
                const seedModule = await import(seedPath)
                
                if (!seedModule.run || typeof seedModule.run !== 'function') {
                    throw new Error(`Seed file ${seedName} must export a 'run' function`)
                }
                
                await seedModule.run(db)
            })
            
            if (error) {
                logger.error(`Failed to run seed '${seedName}' for module '${moduleName}': ${error.message}`)
                results.push({
                    name: seedName,
                    status: 'failed',
                    error: error.message
                })
            } else {
                logger.info(`Successfully ran seed '${seedName}' for module '${moduleName}'`)
                results.push({
                    name: seedName,
                    status: 'success'
                })
            }
        }
        
        return { results }
    }

    public async load(ctx: SetupServerParams) {
        const mods = await this.list({
            enabled: true
        })
        
        const files = mods.flatMap(m => m.files).filter(f => f.type === 'setup:server')
        
        for await (const f of files) {
            const filename = f.src
            const [errorImport, mod] = await tryCatch(() => import(f.src) as Promise<{ default: ServerSetup }>)
        
            if (errorImport) {
                this.logger.error('Error importing setup', errorImport)
                continue
            }
        
            const [error] = await tryCatch(() => mod.default.setup(ctx))
        
            if (error) {
                this.logger.error('Error in setup', error)
                continue
            }
        
            this.logger.debug('setup loaded', { filename })
        }
    }

}