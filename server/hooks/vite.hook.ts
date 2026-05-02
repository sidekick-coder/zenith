import di from '#server/facades/di.facade.ts'
import ExpressService from '#server/services/express.service.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import ViteService from '#server/services/vite.service.ts'
import config from '#server/facades/config.facade.ts'
import LoggerService from '#shared/services/logger.service.ts'

export default class ViteLifecycleHook extends LifecycleHook {
    public order = 98

    public async onRegister(): Promise<void> {
        const logger = di.get<LoggerService>(LoggerService)

        const service = new ViteService({
            logger: logger.child({ label: 'vite' }),
            debug: config.get('vite.debug') || config.get('app.debug'),
        })

        di.set(ViteService, service)
    }

    public async onLoad(): Promise<void> {
        const app = di.get<ExpressService>(ExpressService)
        const vite = di.get<ViteService>(ViteService)

        await vite.load(app.app)

        app.onUnhandlerRouted = (req, res) => {
            return vite.handle({
                url: req.originalUrl,
                request: req,
                response: res,
            })
        }
    }

    public async onShutdown(): Promise<void> {
        const vite = di.get<ViteService>(ViteService)

        await vite.close()
    }
}
