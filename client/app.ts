import './translator.ts'

import './imports'
import './assets/styles.css'

import { container, LifecycleService } from '@sidekick-coder/zenith-kit/client'
import { ConfigService, EmmitterService, LoggerService } from '@sidekick-coder/zenith-kit/shared'

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

    lifecycle.addImports(import.meta.glob('./hooks/*.ts', { eager: true }))

    const emmiter = new EmmitterService({
        debug: config.getOne(['emmitter.debug', 'app.debug', 'debug'], false),
        logger: logger.child({ label: 'emmitter' }),
    })

    container
        .set(ConfigService, config)
        .set(LifecycleService, lifecycle)
        .set(LoggerService, logger)
        .set(EmmitterService, emmiter)

    return { 
        config,
        lifecycle,
        emmiter
    }
}


