import di from '#server/facades/di.facade.ts'
import vite from '#server/facades/vite.facade.ts'
import ExpressService from '#server/services/express.service.ts'
import { LifecycleHook } from '#server/services/lifecycle.service.ts'
import ViteService from '#server/services/vite.service.ts'

export default class AppLifecycleHook extends LifecycleHook {
    public id = 'vite'

    public async onRegister(): Promise<void> {
        di.singleton(ViteService)
    }

    public async onLoad(): Promise<void> {
        const app = di.get<ExpressService>(ExpressService)

        await vite.load(app.app)

        app.onUnhandlerRouted = (req, res) => {
            return vite.render(req.originalUrl, req, res)
        }
    }

    public async onBoot(): Promise<void> {
        
    }
}