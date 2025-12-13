import di from '#server/facades/di.facade.ts'
import env from '#server/facades/env.facade.ts'
import lifecycle from '#server/facades/lifecycle.facade.ts'
import LoggerWinsonService from '#server/services/loggerWinson.service.ts'
import { importAll } from '#server/utils/importAll.ts'
import { basePath } from '#server/utils/paths.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import LoggerService from '#shared/services/logger.service.ts'

di.set(LoggerService, LoggerWinsonService.create({
    transports: [
        LoggerWinsonService.console(),
        LoggerWinsonService.file(basePath('storage/logs/error.log'), 'error'),
        LoggerWinsonService.file(basePath('storage/logs/combined.log')),
    ]
}))

env.load()

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