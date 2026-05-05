import { BaseException, LifecycleHook, LoggerService } from '@sidekick-coder/zenith-kit/shared'
import { container } from '@sidekick-coder/zenith-kit/server'
import ExpressService from '#server/services/express.service.ts'
import ViteService from '#server/services/ViteService.ts'
import type { ViteServiceOptions } from '#server/services/ViteService.ts'
import config from '#server/facades/config.facade.ts'
import ViteDevelopmentService from '#server/services/ViteDevelopmentService.ts'
import env from '#server/facades/env.facade.ts'
import ViteProductionService from '#server/services/ViteProductionService.ts'

export default class ViteLifecycleHook extends LifecycleHook {
    public order = 98

    public async onRegister(): Promise<void> {
        const logger = container.get<LoggerService>(LoggerService)

        let service: ViteService | null = null

        const options: ViteServiceOptions = {
            logger: logger.child({ label: 'vite' }),
            debug: config.getOne(['app.debug', 'vite.debug', 'debug'], false),
        }

        if (env.development) {
            service = new ViteDevelopmentService(options)
        }

        if (env.production) {
            service = new ViteProductionService(options)
        }

        if (!service) {
            throw new BaseException('No Vite service could be created.')
        }

        container.set(ViteService, service)
    }

    public async onLoad(): Promise<void> {
        const app = container.get<ExpressService>(ExpressService)
        const vite = container.get<ViteService>(ViteService)

        await vite.load(app.app)

        app.onUnhandlerRouted = async (req, res) => vite.handle(req, res)
    }

    public async onShutdown(): Promise<void> {
        const vite = container.get<ViteService>(ViteService)

        await vite.close()
    }
}
