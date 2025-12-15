import fs from 'fs'
import { program } from 'commander'
import { importAll } from '#server/utils/importAll.ts'
import { basePath } from '#server/utils/paths.ts'
import config from '#server/facades/config.facade.ts'
import env from '#server/facades/env.facade.ts'
import di from '#server/facades/di.facade.ts'
import LoggerService from '#shared/services/logger.service.ts'
import LoggerWinsonService from '#server/services/loggerWinson.service.ts'
import lifecycle from '#server/facades/lifecycle.facade.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'

di.set(LoggerService, LoggerWinsonService.create({
    transports: [
        LoggerWinsonService.console(),
        LoggerWinsonService.file(basePath('storage/logs/error.log'), 'error'),
        LoggerWinsonService.file(basePath('storage/logs/combined.log')),
    ]
}))

// handle unhandled rejections
process.on('unhandledRejection', (reason: any, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})


env.load()

const mods = await importAll(basePath('server/hooks'))

const exclude = [
    'AppLifecycleHook',
    'ViteLifecycleHook',
    'ModulesClientLifecycleHook',
    'QueueLifecycleHook'
]

const hooks: LifecycleHook[] = Object.values(mods)
    .map(m => m.default || m)
    .filter((HookClass: any) => HookClass.prototype instanceof LifecycleHook)
    .map((HookClass: any) => new HookClass())

lifecycle.add(...hooks)

await lifecycle.register()

await importAll(basePath('server/commands'))

const modulesPath = basePath('modules')

const moduleNames = fs.readdirSync(modulesPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

for await (const name of moduleNames) {
    const enabled = config.get(`modules.enabled.${name}`, false)
    
    if (!enabled) {
        continue
    }
    
    if (fs.existsSync(`${modulesPath}/${name}/server/commands`)) {
        try {
            await importAll(`${modulesPath}/${name}/server/commands`)            
        } catch (error) {
            console.error(`Error loading commands for module ${name}:`, error)
        }
    }
}


program
    .hook('preAction', async () => {
       
        
        await lifecycle.load({
            exclude
        })
        
        await lifecycle.boot({
            exclude
        })
    })
    .hook('postAction', async () => {
        await lifecycle.shutdown({
            exclude
        })
    })
    .parse()