import BaseException from '@sidekick-coder/zenith-kit/shared/exceptions/BaseException'
import LifecycleHook from '@sidekick-coder/zenith-kit/shared/entities/LifecycleHook'
import LoggerService from '@sidekick-coder/zenith-kit/shared/services/LoggerService'
import container from '@sidekick-coder/zenith-kit/server/facades/container'
import HttpService from '@sidekick-coder/zenith-kit/server/services/HttpService'
import config from '@sidekick-coder/zenith-kit/server/facades/config'
import ViteService from '#server/services/ViteService.ts'
import type { ViteServiceOptions } from '#server/services/ViteService.ts'
// import ViteDevelopmentService from '#server/services/ViteDevelopmentService.ts'
import env from '#server/facades/env.facade.ts'
// import ViteProductionService from '#server/services/ViteProductionService.ts'

export default class ViteLifecycleHook extends LifecycleHook {
    public order = 98
    public hook_aliases = ['vite']

    public async onRegister(): Promise<void> {
        const logger = container.get<LoggerService>(LoggerService)

        let service: ViteService | null = null

        const options: ViteServiceOptions = {
            logger: logger.child({ label: 'vite' }),
            debug: config.getOne(['app.debug', 'vite.debug', 'debug'], false),
        }

        if (env.development || env.test) {
            const { default: ViteDevelopmentService } = await import('#server/services/ViteDevelopmentService.ts')
            service = new ViteDevelopmentService(options)
        }

        if (env.production) {
            const { default: ViteProductionService } = await import('#server/services/ViteProductionService.ts')
            service = new ViteProductionService(options)
        }

        if (!service) {
            throw new BaseException('No Vite service could be created.')
        }

        container.set(ViteService, service)
    }

    public async onLoad(): Promise<void> {
        const app = container.get<HttpService>(HttpService)
        const vite = container.get<ViteService>(ViteService)

        await vite.load(app.app)

        app.onUnhandlerRouted = async (req, res) => vite.handle(req, res)
    }

    public async onShutdown(): Promise<void> {
        const vite = container.get<ViteService>(ViteService)

        await vite.close()
    }
}
