import config from '#server/facades/config.facade.ts'
import di from '#server/facades/di.facade.ts'
import env from '#server/facades/env.facade.ts'
import LoggerWinsonService from '#server/services/loggerWinson.service.ts'
import { importAll } from '#server/utils/importAll.ts'
import { basePath } from '#server/utils/paths.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import LifecycleService from '#shared/services/lifecycle.service.ts'
import LoggerService from '#shared/services/logger.service.ts'

// handle unhandled rejections
process.on('unhandledRejection', (reason: any, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error: Error) => {
    console.error('Uncaught Exception:', error)
})

env.load()

const logger = LoggerWinsonService.create({
    level: env.get('LOG_LEVEL', 'info'),
    transports: [
        LoggerWinsonService.console(),
        LoggerWinsonService.file(basePath('storage/logs/error.log'), 'error'),
        LoggerWinsonService.file(basePath('storage/logs/combined.log')),
    ]
})

di.set(LoggerService, logger)

const lifecycle = new LifecycleService({
    debug: config.get('lifecycle.debug') || config.get('app.debug'),
    logger: logger.child({ label: 'lifecycle' }),
})

const mods = await importAll(basePath('server/hooks'))

const hooks: LifecycleHook[] = Object.values(mods)
    .map(m => m.default || m)
    .filter((HookClass: any) => HookClass.prototype instanceof LifecycleHook)
    .map((HookClass: any) => new HookClass())

lifecycle.add(...hooks)

await lifecycle.register()

await lifecycle.load()

await lifecycle.boot()

process.on('SIGINT', async () => {
    await lifecycle.shutdown()
    process.exit(0)
})