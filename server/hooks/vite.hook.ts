import di from '#server/facades/di.facade.ts'
import ExpressService from '#server/services/express.service.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import ViteService from '#server/services/vite.service.ts'

export default class ViteLifecycleHook extends LifecycleHook {
    public async onRegister(): Promise<void> {
        di.singleton(ViteService)
    }

    public async onLoad(): Promise<void> {
        const app = di.get<ExpressService>(ExpressService)
        const vite = di.get<ViteService>(ViteService)

        await vite.load(app.app)

        app.onUnhandlerRouted = (req, res) => {
            return vite.render(req.originalUrl, req, res)
        }
    }

    public async onBoot(): Promise<void> {
        
    }
}