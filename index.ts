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

// server kill signals  1234
process.on('message', (data: any) => {
    if (data?.type === 'shutdown') {
        process.exit(0)
    }
})

env.load()

const transports: any[] = [
    LoggerWinsonService.file(basePath('storage/logs/error.log'), 'error'),
    LoggerWinsonService.file(basePath('storage/logs/app.log')),
]

transports.push(env.development ? LoggerWinsonService.console() : LoggerWinsonService.consoleJson())

const logger = LoggerWinsonService.create({
    level: env.get('LOG_LEVEL', 'info'),
    transports: transports
})

di.set(LoggerService, logger)

const lifecycle = new LifecycleService({
    debug: env.get('LIFECYCLE_DEBUG'),
    logger: logger.child({ label: 'lifecycle' }),
    onError: (error, hookId, method) => {
        logger.error(`lifecycle error in hook "${hookId}" on ${method}:`, error)
        process.exit(1)
    },
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
