import { container, LifecycleService } from '@sidekick-coder/zenith-kit/client'
import { ConfigService, EmmitterService, LoggerService, TranslatorService } from '@sidekick-coder/zenith-kit/shared'
import type { App } from 'vue'
import type { Router } from 'vue-router'
import { createPluginManager } from './plugins.ts'
import { createTranslatorService } from './translator.ts'

interface AppOptions {
    logger: LoggerService
    configEntries: Record<string, any>
    containerEntries: Record<string, any>
}

export async function createApp(options: AppOptions) {
    const logger = options.logger || new LoggerService()

    const config = new ConfigService()

    const lifecycle = new LifecycleService({
        debug: config.getOne(['lifecycle.debug', 'app.debug', 'debug'], false),
        logger: logger.child({ label: 'lifecycle' }),
    })

    container.loadFromRecord(options.containerEntries || {})
    config.loadFromRecord(options.configEntries || [])

    const manager = await createPluginManager({
        config,
        logger: logger.child({ label: 'plugin-manager' }),
    })

    lifecycle.addImports(import.meta.glob('./hooks/*.ts', { eager: true }))

    const emmiter = new EmmitterService({
        debug: config.getOne(['emmitter.debug', 'app.debug', 'debug'], false),
        logger: logger.child({ label: 'emmitter' }),
    })

    const translator = createTranslatorService({
        ...container.get<Record<string,any>>('state').translator,
        debug: config.getOne(['translator.debug', 'app.debug', 'debug'], false),
        logger: logger.child({ label: 'translator' }),
    })

    container
        .set(ConfigService, config)
        .set(LifecycleService, lifecycle)
        .set(LoggerService, logger)
        .set(EmmitterService, emmiter)
        .set(TranslatorService, translator)

    await manager.register()

    await manager.load()

    await lifecycle.emit(['register', 'load', 'boot'])

    const app = container.get<App>('app')
    const router = container.get<Router>('router')

    return { 
        app, 
        router,
        config,
        lifecycle,
        emmiter
    }
}


