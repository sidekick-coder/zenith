import config from '#server/facades/config.facade.ts'
import di from '#server/facades/di.facade.ts'
import app from '#server/facades/app.facade.ts'
import ExpressService from '#server/services/express.service.ts'
import { LifecycleHook } from '#server/services/lifecycle.service.ts'

export default class AppLifecycleHook extends LifecycleHook {
    public id = 'app'

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
    
    public async onBoot(): Promise<void> {
        app.routes()
        await app.start()
    }
}