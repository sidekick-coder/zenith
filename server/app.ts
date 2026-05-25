import { ConfigManagerService, EmmitterService, basePath, LifecycleService } from '@sidekick-coder/zenith-kit/server'
import { container } from '@sidekick-coder/zenith-kit/server'
import { LoggerService, ConfigService, tryCatch } from '@sidekick-coder/zenith-kit/shared'
import PluginManagerService from './services/PluginManagerService.ts'
import env from '#server/facades/env.facade.ts'
import LoggerWinsonService from '#server/services/loggerWinson.service.ts'

globalThis.$try = tryCatch

process.on('unhandledRejection', (reason: any, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error: Error) => {
    console.error('Uncaught Exception:', error)
})

interface AppOptions {
    logger?: LoggerService
}

export async function createApp(options: AppOptions = {}) {
    // logger
    let logger: LoggerService = options.logger as LoggerService

    if (!options.logger) {
        logger = LoggerWinsonService.create({
            level: env.get('ZENITH_LOG_LEVEL', 'info'),
            transports: [
                LoggerWinsonService.console(),
                LoggerWinsonService.file(basePath('logs/error.log'), 'error'),
                LoggerWinsonService.file(basePath('logs/console.log')),
            ]
        })
    }

    container.set(LoggerService, logger)

    // config
    const config = await ConfigManagerService
        .create({
            env: env,
            logger: logger.child({ label: 'config' }),
            silent: true
        })
        .load()

    container.set(ConfigService, config)

    // emmitter
    const emmiter = new EmmitterService({
        debug: config.getOne(['emmitter.debug', 'app.debug', 'debug'], false),
        logger: logger.child({ label: 'emmitter' }),
    })

    container.set(EmmitterService, emmiter)

    // plugins
    const pluginManager = await PluginManagerService
        .create()
        .setConfig(config)
        .setEnv(env)
        .setLogger(logger.child({ label: 'plugins' }))
        .setDebug(config.getOne(['plugins.debug', 'app.debug', 'debug'], false))
        .load()

    container.set(PluginManagerService, pluginManager)


    const lifecycle = new LifecycleService({
        debug: config.getOne(['lifecycle.debug', 'app.debug', 'debug'], false),
        logger: logger.child({ label: 'lifecycle' }),
        onError: async (error) => {
            logger.error(error.message, error)

            process.exit(1)
        }
    })

    await lifecycle.addDirectory(basePath('server/hooks'))

    return {
        logger,
        config,
        emmiter,
        pluginManager,
        lifecycle
    }
}
