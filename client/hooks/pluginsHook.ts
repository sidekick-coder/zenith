import { BaseException, LifecycleHook } from '@sidekick-coder/zenith-kit/shared'
import { config, container, logger as baseLogger } from '@sidekick-coder/zenith-kit/client'
import PluginManagerService from '#client/services/PluginManagerService.ts'
import PluginManagerDevelopmentService from '#client/services/PluginManagerDevelopmentService.ts'

export default class extends LifecycleHook {
    public order = 998

    public async register(): Promise<void> {
        let manager: PluginManagerService | null = null
        const logger = baseLogger.child({ label: 'plugin-manager' })

        if (import.meta.env.DEV) {
            manager = new PluginManagerDevelopmentService({
                debug: config.getOne(['plugins.debug', 'app.debug', 'debug'], false),
                logger: logger.child({ label: 'plugin-manager' }),
            })
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

