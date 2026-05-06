import { BaseException, LifecycleHook } from '@sidekick-coder/zenith-kit/shared'
import { container, logger as baseLogger, config } from '@sidekick-coder/zenith-kit/server'
import env from '#server/facades/env.facade.ts'
import PluginManagerDevelopmentService from '#server/services/PluginManagerDevelopmentService.ts'
import PluginManagerService from '#server/services/PluginManagerService.ts'
import type { PluginManagerServiceOptions } from '#server/services/PluginManagerService.ts'
import PluginManagerProductionService from '#server/services/PluginManagerProductionService.ts'
import emmitter from '#server/facades/emmitter.facade.ts'

export default class extends LifecycleHook {
    public hook_aliases = ['plugin-manager', 'plugins']

    public async register(){
        const logger = baseLogger.child({ label: 'plugin-manager' })

        const options: PluginManagerServiceOptions = {
            logger: logger,
            debug: config.getOne(['plugin-manager.debug', 'app.debug', 'debug'], false)
        }

        let manager: PluginManagerService | null = null

        if (env.development) {
            manager = new PluginManagerDevelopmentService(options)

            container.set(PluginManagerService, manager)
        }

        if (env.production) {
            manager = new PluginManagerProductionService(options)
        }

        if (!manager) {
            throw new BaseException('Failed to initialize PluginManagerService')
        }

        for (const [id, value] of Object.entries(env.get('ZENITH_PLUGINS') || {})) {
            manager.addDir(id, value.directory)
        }

        container.set(PluginManagerService, manager)

        await manager.register()

    }

    public async load() {
        const manager = container.get<PluginManagerService>(PluginManagerService)

        await manager.load()

        emmitter.on('page:request:start', async ctx => {
            ctx.setConfigValue('plugin-manager', { debug: manager.debug })
        })
    }
}

