import { container, emmitter } from '@sidekick-coder/zenith-kit/server'
import config from '#server/facades/config.facade.ts'
import ExpressService from '#server/services/express.service.ts'
import RouterRegister from '#server/services/routerRegister.service.ts'
import RouterService from '#server/services/router.service.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'

export default class AppLifecycleHook extends LifecycleHook {
    public order = 99
    public async onRegister(): Promise<void> {
        const http = new ExpressService()

        const origins = config.get('cors.origins', '')
            .split(',')
            .map((o: string) => o.trim())
            .filter((o: string) => o.length > 0)
    
        http.cors({
            credentials: true,
            origin: origins.length > 0 ? origins : undefined,
        })

        container.set(ExpressService, http)

        await emmitter.emitAndWait('http:registered', { http })
    }

    public async onLoad(): Promise<void> {
        const http = container.get<ExpressService>(ExpressService)
        const router = container.get<RouterRegister>(RouterService)

        http.router = router

        await emmitter.emitAndWait('http:loaded', { http })
    }
    
    public async onBoot(): Promise<void> {
        const http = container.get<ExpressService>(ExpressService)
        
        http.routes()

        http.start()

        await emmitter.emitAndWait('http:booted', { http })
    }

    public async onShutdown(): Promise<void> {
        const http = container.get<ExpressService>(ExpressService)

        await http.stop()

        await emmitter.emitAndWait('http:shutdown', { http })
    }
}
