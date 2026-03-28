import fs from 'fs'
import arte from './facades/arte.facade.ts'
import type ArteService from './services/arte.service.ts'
import ConfigLifecycleHook from './hooks/config.hook.ts'
import { importAll } from '#server/utils/importAll.ts'
import { basePath } from '#server/utils/paths.ts'
import config from '#server/facades/config.facade.ts'
import env from '#server/facades/env.facade.ts'
import di from '#server/facades/di.facade.ts'
import LoggerService from '#shared/services/logger.service.ts'
import LoggerWinsonService from '#server/services/loggerWinson.service.ts'
import LifecycleService from '#shared/services/lifecycle.service.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'

const logger = LoggerWinsonService.create({
    transports: [
        LoggerWinsonService.console(),
        LoggerWinsonService.file(basePath('storage/logs/error.log'), 'error'),
        LoggerWinsonService.file(basePath('storage/logs/combined.log')),
    ]
})

di.set(LoggerService, logger)

env.load()

await importAll(basePath('server/commands'))

const modulesPath = basePath('modules')

const moduleNames = fs.readdirSync(modulesPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

for await (const name of moduleNames) {
    if (fs.existsSync(`${modulesPath}/${name}/server/commands`)) {
        try {
            await importAll(`${modulesPath}/${name}/server/commands`)            
        } catch (error) {
            console.error(`Error loading commands for module ${name}:`, error)
        }
    }
}

const mods = await importAll(basePath('server/hooks'))

const hooks: LifecycleHook[] = Object.values(mods)
    .map(m => m.default || m)
    .filter((HookClass: any) => HookClass.prototype instanceof LifecycleHook)
    .map((HookClass: any) => new HookClass())

const lifecycle = new LifecycleService({
    debug: env.get('LIFECYCLE_DEBUG'),
    logger: logger.child({ label: 'lifecycle' }),
})

lifecycle.add(ConfigLifecycleHook)

const alias: Record<string, string> = { 
    'translator': 'TrasnlatorLifecycleHook',
    'db': 'DatabaseLifecycleHook',
} 

async function onPreAction(command: ArteService) {
    const needs = Array.from(command.needs).map(need => alias[need] || need)

    hooks.filter(hook => needs.includes(hook.hook_id)).forEach(hook => lifecycle.add(hook))

    await lifecycle.register()

    await lifecycle.load()
    
    await lifecycle.boot()
}

async function onPostAction() {
    await lifecycle.shutdown()
}


arte.name('arte')
    .hook('preAction', (_thisCommand, actionCommand) => onPreAction(actionCommand as any))
    .hook('postAction', onPostAction)
    .parse()
