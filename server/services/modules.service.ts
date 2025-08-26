import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import rootLogger from '../facades/logger.facade.ts'
import build from './build.service.ts'
import bootService from './boot.service.ts'
import config from '#server/facades/config.facade.ts'
import {
    basePath,
    storagePath
} from '#server/utils/paths.ts'
import router from '#server/facades/router.facade.ts'
import { tryCatch } from '#shared/tryCatch.ts'
import migrator from '#server/database/migrator.ts'

const logger = rootLogger.child({ label: 'modules.service' })

/**
 * Execute a shell command and return a promise
 */
function executeCommand(command: string, args: string[], options: { cwd?: string } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd: options.cwd || process.cwd(),
            stdio: 'inherit',
            shell: true,
        })

        child.on('close', (code) => {
            if (code === 0) {
                resolve()
            } else {
                reject(new Error(`Command failed with exit code ${code}`))
            }
        })

        child.on('error', (error) => {
            reject(error)
        })
    })
}

interface Options {
    build?: boolean;
    boot?: boolean;
}

interface InstallOptions {
    enable?: boolean
    migrate?: boolean
    seeds?: boolean
    npm?: boolean
}

interface UninstallOptions {
    rollback?: boolean
}

class Module {
    public id: string
    public name: string
    public enabled: boolean = false

    constructor(name: string) {
        this.id = name
        this.name = name
    }

    public makePath(...parts: string[]) {
        return basePath('modules', this.name, ...parts)
    }

    public async loadRoutes(){
        const filename = this.makePath('server', 'routes.ts')

        if (!fs.existsSync(filename)) {
            return
        }

        await router.loadFile(filename)
    }
}

interface ListOptions {
    enabled?: boolean;
}

export class ModulesService {
    public async list(options: ListOptions = {}) {
        const modulesPath = basePath('modules')
        const moduleNames = fs.readdirSync(modulesPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)

        let items = [] as Module[]

        for (const name of moduleNames) {
            const mod = new Module(name)

            mod.enabled = config.get(`modules.enabled.${name}`, false)

            items.push(mod)
        }

        if (options?.enabled) {
            items = items.filter(mod => mod.enabled)
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

    private async createModuleRuntimeFiles(mod: Module) {
        if (fs.existsSync(mod.makePath('server', 'setup.server.ts'))) {
            const filename = storagePath('runtime', 'server', `${mod.id}.setup.ts`)

            const content = [
                `import setup from '#modules/${mod.id}/server/setup.server.ts'`,
                `export const name = '${mod.id}.setup'`,
                'export default setup;',
            ].join('\n')

            if (!fs.existsSync(path.dirname(filename))) {
                fs.mkdirSync(path.dirname(filename), { recursive: true })
            }

            fs.writeFileSync(filename, content, 'utf-8')

            logger.debug('created server runtime file', { filename, })
        }

        if (fs.existsSync(mod.makePath('client', 'setup.client.ts'))) {
            const filename = storagePath('runtime', 'client', `${mod.id}.setup.ts`)
            
            const content = [
                `import setup from '#modules/${mod.id}/client/setup.client.ts'`,
                `export const name = '${mod.id}.setup'`,
                'export default setup;',
            ].join('\n')

            if (!fs.existsSync(path.dirname(filename))) {
                fs.mkdirSync(path.dirname(filename), { recursive: true })
            }

            fs.writeFileSync(filename, content, 'utf-8')

            logger.debug('created client runtime file', { filename, })
        }
    }

    private async removeModuleRuntimeFiles(mod: Module) {
        const serverFile = storagePath('runtime', 'server', `${mod.id}.setup.ts`)
        const clientFile = storagePath('runtime', 'client', `${mod.id}.setup.ts`)

        if (fs.existsSync(serverFile)) {
            fs.unlinkSync(serverFile)
            logger.debug('removed server runtime file', { filename: serverFile, })
        }

        if (fs.existsSync(clientFile)) {
            fs.unlinkSync(clientFile)
            logger.debug('removed client runtime file', { filename: clientFile, })
        }
    }

    public async enable(moduleName: string, options: Options = {}) {
        const mod = await this.find(moduleName)

        if (!mod) {
            throw new Error(`Module ${moduleName} not found`)
        }

        if (mod.enabled) {
            logger.debug(`Module ${moduleName} is already enabled`)
            return
        }

        await this.createModuleRuntimeFiles(mod)

        if (options?.build) {
            await build.all()
        }

        if (options?.boot) {
            await bootService.boot()
        }

        config.set(`modules.enabled.${moduleName}`, true)

        logger.info(`module ${moduleName} enabled`)
    }

    public async disable(moduleName: string, options: Options = {}) {
        const mod = await this.findOrFail(moduleName)

        if (!mod.enabled) {
            logger.info(`Module ${moduleName} is already disabled`)
            return
        }

        await this.removeModuleRuntimeFiles(mod)

        if (options?.build) {
            await build.all()
        }

        if (options?.boot) {
            await bootService.boot()
        }

        config.set(`modules.enabled.${moduleName}`, false)

        logger.info(`module ${moduleName} disabled`)
    }

    public async toggle(moduleName: string, options: Options = {}) {
        if (config.get(`modules.enabled.${moduleName}`)) {
            return this.disable(moduleName, options)
        }

        return await this.enable(moduleName, options)
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
        ]

        for (const { source, target } of symlinks) {
            if (fs.existsSync(target)) {
                logger.debug(`Target directory '${target}' exist, skipping symlink`)
                continue
            }

            // Create symlink
            const [symlinkError] = await tryCatch(() => fs.symlinkSync(source, target, 'dir'))
            
            if (symlinkError) {
                logger.error(`Failed to create symlink ${source} -> ${target}: ${symlinkError.message}`)
                throw new Error(`Failed to create symlink: ${symlinkError.message}`)
            }

            logger.debug(`Created symlink: ${path.basename(source)} -> ${target}`)
        }

        logger.info(`Symlinks prepared for module '${moduleName}'`)
    }

    public async install(githubRepo: string, options: InstallOptions = {}) {
        // Extract module name from owner/repo format
        const parts = githubRepo.split('/')
        
        if (parts.length !== 2) {
            throw new Error('Invalid GitHub repository format. Use "owner/repo" format.')
        }

        const [_owner, moduleName] = parts
        const modulesDir = basePath('modules')
        const moduleDir = path.join(modulesDir, moduleName)

        // Check if module already exists
        if (fs.existsSync(moduleDir)) {
            throw new Error(`Module '${moduleName}' already exists`)
        }

        // Ensure modules directory exists
        if (!fs.existsSync(modulesDir)) {
            fs.mkdirSync(modulesDir, { recursive: true })
        }

        logger.info(`Installing module from GitHub repository: ${githubRepo}`)

        const gitUrl = `https://github.com/${githubRepo}.git`

        // Clone the repository
        const [cloneError] = await tryCatch(() => executeCommand('git', ['clone', gitUrl, moduleDir]))
        
        if (cloneError) {
            logger.error(`Failed to clone repository: ${cloneError.message}`)

            throw new Error(`Failed to clone repository: ${cloneError.message}`)
        }

        logger.info(`Module '${moduleName}' cloned successfully`)

        // Install dependencies if package.json exists and npm option is enabled
        if (options.npm && fs.existsSync(path.join(moduleDir, 'package.json'))) {
            
            logger.info('npm install')

            await executeCommand('npm', ['install'], { cwd: moduleDir })
        }

        // Prepare symlinks for the module
        await this.prepare(moduleName)

        // Enable the module by default after installation if enable option is not false
        if (options.enable) {
            await this.enable(moduleName)
        }

        if (options.migrate) {
            const result = await migrator.migrateByModule(moduleName)

            logger.info(`Migrations for module '${moduleName}' completed successfully`, result)
        }

        logger.info(`Module '${moduleName}' installed successfully`)
    }

    public async uninstall(moduleName: string, options: UninstallOptions = {}) {
        const mod = await this.findOrFail(moduleName)
        const moduleDir = mod.makePath()

        logger.info(`Uninstalling module '${moduleName}'`)

        // Rollback migrations if requested
        if (options.rollback) {
            const result = await migrator.rollbackByModule(moduleName)
            logger.info(`Migrations for module '${moduleName}' rolled back successfully`, result)
        }

        // Disable the module
        if (mod.enabled) {
            await this.disable(moduleName)
        }

        // Remove module folder        
        const [removeError] = await tryCatch(() => fs.rmSync(moduleDir, { 
            recursive: true, 
            force: true 
        }))
            
        if (removeError) {
            logger.error(`Failed to remove module directory: ${removeError.message}`)
            throw new Error(`Failed to remove module directory: ${removeError.message}`)
        }

        logger.info(`Module directory '${moduleDir}' removed successfully`)

        logger.info(`Module '${moduleName}' uninstalled successfully`)
    }
}

const modules = new ModulesService()

export default modules