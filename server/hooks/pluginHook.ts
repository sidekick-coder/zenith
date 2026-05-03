import { BaseException, LifecycleHook } from '@sidekick-coder/zenith-kit/shared'
import { container, logger as baseLogger } from '@sidekick-coder/zenith-kit/server'
import env from '#server/facades/env.facade.ts'
import PluginManagerDevelopmentService from '#server/services/PluginManagerDevelopmentService.ts'
import PluginManagerService from '#server/services/PluginManagerService.ts'

export default class extends LifecycleHook {
    public hook_aliases = ['plugin-manager', 'plugins']

    public async register(){
        const logger = baseLogger.child({ label: 'plugin-manager' })

        let manager: PluginManagerService | null = null

        if (env.development) {
            manager = new PluginManagerDevelopmentService({
                logger: logger,
                debug: true 
            })

            container.set(PluginManagerService, manager)
        }

        if (!manager) {
            throw new BaseException('Failed to initialize PluginManagerService')
        }

        for (const [id, value] of Object.entries(env.get('ZENITH_PLUGINS') || {})) {
            manager.addPluginDir(id, value.directory)
        }

        await manager.discover()
    }

    public async load() {
        const manager = container.get<PluginManagerService>(PluginManagerService)

        await manager.load()
    }

    public async boot() {
        const manager = container.get<PluginManagerService>(PluginManagerService)

        await manager.boot()
    }
}

