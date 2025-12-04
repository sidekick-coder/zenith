import di from '#server/facades/di.facade.ts'
import ExpressService from '#server/services/express.service.ts'
import RouterSevice from '#server/services/router.service.ts'
import { LifecycleHook } from '#server/services/lifecycle.service.ts'

export default class RouterLifecycleHook extends LifecycleHook {
    public id = 'route'

    public async onRegister(): Promise<void> {
        di.singleton(RouterSevice)
    }

    public async onLoad(): Promise<void> {
        const app = di.get<ExpressService>(ExpressService)
        const router = di.get<RouterSevice>(RouterSevice)

        app.router = router
    }

    public async onBoot(): Promise<void> {
        
    }
}