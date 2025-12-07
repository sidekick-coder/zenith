import config from '#server/facades/config.facade.ts'
import di from '#server/facades/di.facade.ts'
import app from '#server/facades/app.facade.ts'
import ExpressService from '#server/services/express.service.ts'
import RouterRegister from '#server/services/routerRegister.service.ts'
import RouterService from '#server/services/router.service.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'

export default class AppLifecycleHook extends LifecycleHook {
    public async onRegister(): Promise<void> {
        di.singleton(ExpressService)

        const origins = config.get('cors.origins', '')
            .split(',')
            .map((o: string) => o.trim())
            .filter((o: string) => o.length > 0)
    
        app.cors({
            credentials: true,
            origin: origins.length > 0 ? origins : undefined,
        })

    }

    public async onLoad(): Promise<void> {
        const app = di.get<ExpressService>(ExpressService)
        const router = di.get<RouterRegister>(RouterService)

        app.router = router
    }
    
    public async onBoot(): Promise<void> {
        app.routes()

        await app.start()
    }

    public async onShutdown(): Promise<void> {
        await app.stop()
    }
}