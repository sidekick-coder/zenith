import { LifecycleHook } from '@sidekick-coder/zenith-kit/shared'
import di from '#server/facades/di.facade.ts'
import RouterSevice from '#server/services/router.service.ts'
import RouterRegister from '#server/services/routerRegister.service.ts'
import { serverPath } from '#server/utils/paths.ts'
import config from '#server/facades/config.facade.ts'
import setupMiddleware from '#server/middlewares/setup.middleware.ts'
import authSilenceMiddleware from '#server/middlewares/authSilence.middleware.ts'
import authorizationMiddleware from '#server/middlewares/authorization.middleware.ts'
import RouterFileBaseRoutingService from '#server/services/routerFileBaseRouting.service.ts'

export default class extends LifecycleHook {
    public order = 97
    public hook_aliases = ['router']

    public async onRegister(): Promise<void> {
        const router = new RouterRegister({
            debug: config.get('router.debug') || config.get('app.debug') || false,
            metadata: { id: 'main-router', }
        })

        router.use(setupMiddleware, 'global')

        if (config.has('database')) {
            router.use(authSilenceMiddleware, 'global')
            router.use(authorizationMiddleware, 'global')
        }

        di.set(RouterSevice, router)
    }

    public async onLoad(): Promise<void> {
        const router = di.get<RouterRegister>(RouterSevice)

        router.addDir(serverPath('routes'), { module: 'root' })

        await RouterFileBaseRoutingService
            .create(serverPath('api'))
            .setPrefix('/api')
            .setRouter(router)
            .setModule('root')
            .load()
    }

    public async onBoot(): Promise<void> {
        const router = di.get<RouterRegister>(RouterSevice)

        await router.load()
    }

    public async onShutdown(): Promise<void> {
        const router = di.get<RouterRegister>(RouterSevice)

        await router.clear()
    }
}
