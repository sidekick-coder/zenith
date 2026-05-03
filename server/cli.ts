import fs from 'fs'
import { ConfigManagerService, basePath, LifecycleService, importAll } from '@sidekick-coder/zenith-kit/server'
import ArteService from './services/arte.service.ts'
import env from '#server/facades/env.facade.ts'
import di from '#server/facades/di.facade.ts'
import LoggerService from '#shared/services/logger.service.ts'
import LoggerWinsonService from '#server/services/loggerWinson.service.ts'
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
    .create({
        env: env,
        logger: logger.child({ label: 'config' }),
        silent: true
    })
    .load()

const cli = new ArteService()

di
    .set(LoggerService, logger)
    .set(ConfigService, config)
    .set(ArteService, cli)

const lifecycle = new LifecycleService({
    debug: config.getOne(['lifecycle.debug', 'app.debug', 'debug'], false),
    logger: logger.child({ label: 'lifecycle' }),
})

await lifecycle.addDirectory(basePath('server/hooks'))

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

async function onPreAction(command: ArteService) {
    const include = Array.from(command.needs)
    const defaults = ['TrasnlatorLifecycleHook']

    include.unshift(...defaults)

    await lifecycle.emit(['register', 'load', 'boot'], { include })
}

async function onPostAction(command: ArteService) {
    const include = Array.from(command.needs)
    const defaults = ['TrasnlatorLifecycleHook']

    include.unshift(...defaults)

    await lifecycle.emit('shutdown', { include })
}

cli.name('arte')
    .hook('preAction', (_thisCommand, actionCommand) => onPreAction(actionCommand as any))
    .hook('postAction', (_thisCommand, actionCommand) => onPostAction(actionCommand as any))
    .parse()
