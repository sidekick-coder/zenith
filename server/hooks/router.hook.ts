import di from '#server/facades/di.facade.ts'
import ExpressService from '#server/services/express.service.ts'
import RouterSevice from '#server/services/router.service.ts'
import { LifecycleHook } from '#server/services/lifecycle.service.ts'
import RouterRegister from '#server/services/routerRegister.service.ts'
import { serverPath } from '#server/utils/paths.ts'
import config from '#server/facades/config.facade.ts'
import setupMiddleware from '#server/middlewares/setup.middleware.ts'
import authSilenceMiddleware from '#server/middlewares/authSilence.middleware.ts'
import authorizationMiddleware from '#server/middlewares/authorization.middleware.ts'

export default class RouterLifecycleHook extends LifecycleHook {
    public id = 'route'

    public async onRegister(): Promise<void> {
        const router = new RouterRegister({
            debug: config.getOne(['app.debug', 'router.debug'], 'false') === 'true',
            metadata: {
                id: 'main-router',
            }
        })

        router.use(setupMiddleware, 'global')
        router.use(authSilenceMiddleware, 'global')
        router.use(authorizationMiddleware, 'global')

        di.set(RouterSevice, router)
    }

    public async onLoad(): Promise<void> {
        const app = di.get<ExpressService>(ExpressService)
        const router = di.get<RouterRegister>(RouterSevice)
        
        app.router = router
        
        router.addDir(serverPath('routes'))
        
        await router.load()
    }

    public async onBoot(): Promise<void> {
        
    }
}