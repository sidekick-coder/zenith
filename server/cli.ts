import fs from 'fs'
import { ConfigManagerService, basePath, importAll } from '@sidekick-coder/zenith-kit/server'
import ArteService from './services/arte.service.ts'
import env from '#server/facades/env.facade.ts'
import di from '#server/facades/di.facade.ts'
import LoggerService from '#shared/services/logger.service.ts'
import LoggerWinsonService from '#server/services/loggerWinson.service.ts'
import LifecycleService from '#shared/services/lifecycle.service.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import ConfigService from '#shared/services/config.service.ts'

const logger = LoggerWinsonService.create({
    level: env.get('ZENITH_LOG_LEVEL', 'info'),
    transports: [
        LoggerWinsonService.console(),
        LoggerWinsonService.file(basePath('storage/logs/error.log'), 'error'),
        LoggerWinsonService.file(basePath('storage/logs/console.log')),
    ]
})


const config = await ConfigManagerService
    .create(env, logger.child({ label: 'config' }))
    .load()

const arte = new ArteService()

di
    .set(LoggerService, logger)
    .set(ConfigService, config)
    .set(ArteService, arte)

const mods = await importAll(basePath('server/hooks'))

const hooks: LifecycleHook[] = Object.values(mods)
    .map(m => m.default || m)
    .filter((HookClass: any) => HookClass.prototype instanceof LifecycleHook)
    .map((HookClass: any) => new HookClass())

const lifecycle = new LifecycleService({
    debug: env.get('LIFECYCLE_DEBUG'),
    logger: logger.child({ label: 'lifecycle' }),
})

await importAll(basePath('server/commands'), { exclude: ['test.ts'], })

const modulesPath = basePath('modules')

const moduleNames = fs.readdirSync(modulesPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

for await (const name of moduleNames) {
    if (!config.get(`modules.${name}.enabled`)) {
        continue
    }

    if (fs.existsSync(`${modulesPath}/${name}/server/commands`)) {
        await importAll(`${modulesPath}/${name}/server/commands`, {
            onError: ({ filename, error }) => {
                logger.error(`Failed to import command from ${filename}`, error)
            }
        })
    }
}


const alias: Record<string, string> = {
    'translator': 'TrasnlatorLifecycleHook',
    'db': 'DatabaseLifecycleHook',
    'modules': 'ModulesLifecycleHook',
    'drive': 'DriveLifecycleHook',
    'mailer': 'MailerLifecycleHook',
    'router': 'RouterLifecycleHook',
    'shell': 'ExtrasLifecycleHook',
}

async function onPreAction(command: ArteService) {
    const needs = Array.from(command.needs).map(need => alias[need] || need)
    const defaults = ['TrasnlatorLifecycleHook']

    needs.unshift(...defaults)

    hooks
        .filter(h => needs.includes(h.hook_id))
        .forEach(hook => lifecycle.add(hook))

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
