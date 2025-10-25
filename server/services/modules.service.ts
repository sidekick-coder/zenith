import fs from 'fs'
import path from 'path'
import rootLogger from '../facades/logger.facade.ts'
import ModuleInstallerService from './moduleInstaller.service.ts'
import ModuleUpgraderService from './moduleUpgrader.service.ts'
import ModuleBuilderService from './moduleBuilder.service.ts'
import config from '#server/facades/config.facade.ts'
import { basePath } from '#server/utils/paths.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import migrator from '#server/facades/migrator.facade.ts'
import Module from '#server/entities/module.entity.ts'

const logger = rootLogger.child({ label: 'modules' })

interface UninstallOptions {
    rollback?: boolean
}
interface ListOptions {
    enabled?: boolean;
}

export class ModulesService {
    public installer = new ModuleInstallerService()
    public upgrader = new ModuleUpgraderService()
    public builder = new ModuleBuilderService()

    constructor(
        installer?: ModuleInstallerService,
        upgrader?: ModuleUpgraderService
    ) {
        if (installer) {
            this.installer = installer
        }
        
        if (upgrader) {
            this.upgrader = upgrader
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

    public async uninstall(moduleName: string, options: UninstallOptions = {}) {
        const mod = await this.findOrFail(moduleName)
        const moduleDir = mod.makePath()

        logger.info(`uninstalling module '${moduleName}'`)

        // Rollback migrations if requested
        if (options.rollback) {
            await migrator.rollback({
                module: moduleName
            })
        }

        // Remove module folder        
        fs.rmSync(moduleDir, { 
            recursive: true, 
            force: true 
        })

        logger.info(`'${moduleName}' uninstalled successfully`)
    }

}

const modules = new ModulesService()

export default modules