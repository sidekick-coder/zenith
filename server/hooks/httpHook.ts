import { container, emmitter } from '@sidekick-coder/zenith-kit/server'
import config from '#server/facades/config.facade.ts'
import ExpressService from '#server/services/express.service.ts'
import RouterRegister from '#server/services/routerRegister.service.ts'
import RouterService from '#server/services/router.service.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'

export default class AppLifecycleHook extends LifecycleHook {
    public order = 99
    public async onRegister(): Promise<void> {
        const service = new ExpressService()

        const origins = config.get('cors.origins', '')
            .split(',')
            .map((o: string) => o.trim())
            .filter((o: string) => o.length > 0)
    
        service.cors({
            credentials: true,
            origin: origins.length > 0 ? origins : undefined,
        })

        container.set(ExpressService, service)

        await emmitter.emitAndWait('http:registered', service)
    }

    public async onLoad(): Promise<void> {
        const service = container.get<ExpressService>(ExpressService)
        const router = container.get<RouterRegister>(RouterService)

        service.router = router

        await emmitter.emitAndWait('http:loaded', service)
    }
    
    public async onBoot(): Promise<void> {
        const service = container.get<ExpressService>(ExpressService)
        
        service.routes()

        service.start()

        await emmitter.emitAndWait('http:booted', service)
    }

    public async onShutdown(): Promise<void> {
        const service = container.get<ExpressService>(ExpressService)

        await service.stop()

        await emmitter.emitAndWait('http:shutdown', service)
    }
}
