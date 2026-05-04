import { LifecycleHook, LoggerService } from '@sidekick-coder/zenith-kit/shared'
import { container } from '@sidekick-coder/zenith-kit/server'
import ExpressService from '#server/services/express.service.ts'
import ViteService from '#server/services/ViteService.ts'
import config from '#server/facades/config.facade.ts'
import ViteDevelopmentService from '#server/services/ViteDevelopmentService.ts'

export default class ViteLifecycleHook extends LifecycleHook {
    public order = 98

    public async onRegister(): Promise<void> {
        const logger = container.get<LoggerService>(LoggerService)

        const service = new ViteDevelopmentService({
            logger: logger.child({ label: 'vite' }),
            debug: config.getOne(['app.debug', 'vite.debug'], false),
        })

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
