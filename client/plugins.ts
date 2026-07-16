import { BaseException, ConfigService, LoggerService } from '@sidekick-coder/zenith-kit/shared'
import PluginManagerDevelopmentService from '#client/services/PluginManagerDevelopmentService.ts'
import type { PluginManagerServiceOptions } from '#client/services/PluginManagerService.ts'
import PluginManagerService from '#client/services/PluginManagerService.ts'

interface Options {
    config: ConfigService 
    logger: LoggerService
}

export async function createPluginManager({ config, logger }: Options): Promise<PluginManagerService> {
    let pluginManager: PluginManagerService | null = null

    const options: PluginManagerServiceOptions = {
        debug: config.getOne(['plugin-manager.debug', 'app.debug', 'debug'], false),
        logger: logger,
    }

    if (import.meta.env.PROD && !import.meta.env.SSR) {
        const PluginManagerProductionBrowserService = (await import('#client/services/PluginManagerProductionBrowserService.ts')).default

        pluginManager = new PluginManagerProductionBrowserService(options)
    }

    if (import.meta.env.PROD && import.meta.env.SSR) {
        const PluginManagerProductionNodeService = (await import('#client/services/PluginManagerProductionNodeService.ts')).default

        pluginManager = new PluginManagerProductionNodeService(options)
    }

    if (import.meta.env.DEV) {
        pluginManager = new PluginManagerDevelopmentService(options)
    }

    if (!pluginManager) {
        throw new BaseException('Failed to initialize PluginManagerService')
    }

    return pluginManager
}


