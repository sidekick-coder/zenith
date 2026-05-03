import { ConfigManagerService, LifecycleService, basePath } from '@sidekick-coder/zenith-kit/server'
import { LoggerService, ConfigService } from '@sidekick-coder/zenith-kit/shared'
import env from '#server/facades/env.facade.ts'
import container from '#server/facades/di.facade.ts'
import LoggerWinsonService from '#server/services/loggerWinson.service.ts'

// handle unhandled rejections
process.on('unhandledRejection', (reason: any, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error: Error) => {
    console.error('Uncaught Exception:', error)
})

env.load()

const logger = LoggerWinsonService.create({
    level: env.get('ZENITH_LOG_LEVEL', 'info'),
    transports: [
        LoggerWinsonService.file(basePath('logs/error.log'), 'error'),
        LoggerWinsonService.file(basePath('logs/app.log')),
        env.development ? LoggerWinsonService.console() : LoggerWinsonService.consoleJson(),
    ]
})

const config = await ConfigManagerService
    .create({ 
        env: env, 
        logger: logger.child({ label: 'config' }) 
    })
    .load()

const lifecycle = new LifecycleService({
    debug: env.get('ZENITH_LIFECYCLE_DEBUG', false),
    logger: logger.child({ label: 'lifecycle' }),
})

container
    .set(LoggerService, logger)
    .set(ConfigService, config)

async function exit(code = 0) {
    process.exit(code)
}

process.on('SIGINT', () => exit(0))

process.on('message', (data: any) => {
    if (data?.type === 'shutdown') exit(0)
})

await lifecycle.addDirectory(basePath('server/hooks'))

await lifecycle.register()

await lifecycle.load()

await lifecycle.boot()
