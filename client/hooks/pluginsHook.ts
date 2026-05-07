import { BaseException, LifecycleHook } from '@sidekick-coder/zenith-kit/shared'
import { config, container, logger } from '@sidekick-coder/zenith-kit/client'
import PluginManagerService from '#client/services/PluginManagerService.ts'
import type { PluginManagerServiceOptions } from '#client/services/PluginManagerService.ts'
import PluginManagerDevelopmentService from '#client/services/PluginManagerDevelopmentService.ts'

export default class extends LifecycleHook {
    public order = 998

    public async register(): Promise<void> {
        let manager: PluginManagerService | null = null

        const options: PluginManagerServiceOptions = {
            debug: config.getOne(['plugin-manager.debug', 'app.debug', 'debug'], false),
            logger: logger.child({ label: 'plugin-manager' }),
        }

        if (import.meta.env.PROD && !import.meta.env.SSR) {
            const PluginManagerProductionBrowserService = (await import('#client/services/PluginManagerProductionBrowserService.ts')).default 

            manager = new PluginManagerProductionBrowserService(options)
        }

        if (import.meta.env.PROD && import.meta.env.SSR) {
            const PluginManagerProductionNodeService = (await import('#client/services/PluginManagerProductionNodeService.ts')).default

            manager = new PluginManagerProductionNodeService(options)
        }

        if (import.meta.env.DEV) {
            manager = new PluginManagerDevelopmentService(options)
        }

        if (!manager) {
            throw new BaseException('Failed to initialize PluginManagerService')
        }

        container.set(PluginManagerService, manager)

        await manager.register()
    }

    public async load(): Promise<void> {
        const manager = container.get<PluginManagerService>(PluginManagerService)

        await manager.load()
    }
}

