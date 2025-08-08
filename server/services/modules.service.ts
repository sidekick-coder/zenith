import fs from 'fs'
import path from 'path'
import rootLogger from '../facades/logger.facade.ts'
import env from '../env.ts'
import config from './config.service.ts'
import build from './build.service.ts'
import bootService from './boot.service.ts'
import {
    basePath, clientPath, serverPath 
} from '#server/utils/paths.ts'
import router from '#server/facades/router.facade.ts'

const logger = rootLogger.child({ label: 'modules.service' })
interface Options {
    build?: boolean;
    boot?: boolean;
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

        const enabled = config.get('modules.enabled', [])

        let items = [] as Module[]

        for (const name of moduleNames) {
            const mod = new Module(name)

            mod.enabled = enabled.includes(name)

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
            const filename = serverPath('.runtime', `${mod.id}.setup.ts`)

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
            const filename = clientPath('.runtime', `${mod.id}.setup.ts`)
            
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
        const serverFile = serverPath('.runtime', `${mod.id}.setup.ts`)
        const clientFile = clientPath('.runtime', `${mod.id}.setup.ts`)

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

        let enabled = config.get('modules.enabled', [])

        enabled.push(moduleName)

        enabled = [...new Set(enabled)] // Ensure unique entries

        config.set('modules.enabled', enabled)

        logger.info(`module ${moduleName} enabled`)
    }

    public async disable(moduleName: string, options: Options = {}) {
        const mod = await this.find(moduleName)

        if (!mod) {
            throw new Error(`Module ${moduleName} not found`)
        }

        if (!mod.enabled) {
            logger.debug(`Module ${moduleName} is already disabled`)
            return
        }

        await this.removeModuleRuntimeFiles(mod)

        if (options?.build) {
            await build.all()
        }

        if (options?.boot) {
            await bootService.boot()
        }

        const enabled = config.get('modules.enabled', [])

        const index = enabled.indexOf(moduleName)

        if (index > -1) {
            enabled.splice(index, 1)
        }

        config.set('modules.enabled', enabled)

        logger.info(`module ${moduleName} disabled`)
    }

    public async toggle(moduleName: string, options: Options = {}) {
        const enabled = config.get('modules.enabled', [])

        if (enabled.includes(moduleName)) {
            return this.disable(moduleName, options)
        }

        return await this.enable(moduleName, options)
    }
}

const modules = new ModulesService()

export default modules
