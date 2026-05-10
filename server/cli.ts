import { ConfigManagerService, basePath, LifecycleService, importAll } from '@sidekick-coder/zenith-kit/server'
import { container, CliService } from '@sidekick-coder/zenith-kit/server'
import { LoggerService, ConfigService } from '@sidekick-coder/zenith-kit/shared'
import PluginManagerService from './services/PluginManagerService.ts'
import emmitter from './facades/emmitter.facade.ts'
import env from '#server/facades/env.facade.ts'
import LoggerWinsonService from '#server/services/loggerWinson.service.ts'

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

const pluginManager = await PluginManagerService
    .create()
    .setConfig(config)
    .setEnv(env)
    .setLogger(logger.child({ label: 'plugins' }))
    .setDebug(config.getOne(['plugins.debug', 'app.debug', 'debug'], false))
    .load()

const cli = await CliService
    .create()
    .setLogger(logger.child({ label: 'cli' }))
    .setDebug(config.getOne(['cli.debug', 'app.debug', 'debug'], false))
    .setEmmitter(emmitter)
    .load()

const lifecycle = new LifecycleService({
    debug: config.getOne(['lifecycle.debug', 'app.debug', 'debug'], false),
    logger: logger.child({ label: 'lifecycle' }),
})

container
    .set(LoggerService, logger)
    .set(ConfigService, config)
    .set(CliService, cli)
    .set(PluginManagerService, pluginManager)

await lifecycle.addDirectory(basePath('server/hooks'))

await importAll(basePath('server/commands'), { exclude: ['test.ts'], })


async function onPreAction(command: CliService) {
    const include = Array.from(command.needs)
    const defaults = ['TrasnlatorLifecycleHook']

    include.unshift(...defaults)

    await lifecycle.emit(['register', 'load', 'boot'], { include })
}

async function onPostAction(command: CliService) {
    const include = Array.from(command.needs)
    const defaults = ['TrasnlatorLifecycleHook']

    include.unshift(...defaults)

    await lifecycle.emit('shutdown', { include })
}

cli
    .name('zenith')
    .hook('preAction', (_thisCommand, actionCommand) => onPreAction(actionCommand as any))
    .hook('postAction', (_thisCommand, actionCommand) => onPostAction(actionCommand as any))
    .parse()
