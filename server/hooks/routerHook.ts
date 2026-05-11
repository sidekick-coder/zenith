import { LifecycleHook } from '@sidekick-coder/zenith-kit/shared'
import { emmitter, config, container, RouterService, logger } from '@sidekick-coder/zenith-kit/server'
import RouterRegister from '#server/services/routerRegister.service.ts'
import { serverPath } from '#server/utils/paths.ts'
import setupMiddleware from '#server/middlewares/setup.middleware.ts'
import authSilenceMiddleware from '#server/middlewares/authSilence.middleware.ts'
import authorizationMiddleware from '#server/middlewares/authorization.middleware.ts'
import RouterFileBaseRoutingService from '#server/services/routerFileBaseRouting.service.ts'

export default class extends LifecycleHook {
    public order = 97
    public hook_aliases = ['router']

    public async onRegister(): Promise<void> {
        const router = new RouterRegister({
            debug: config.getOne(['router.debug', 'app.debug', 'debug'], false),
            logger: logger.child({ label: 'router' }) 
        })

        router.use(setupMiddleware, 'global')

        if (config.has('database')) {
            router.use(authSilenceMiddleware, 'global')
            router.use(authorizationMiddleware, 'global')
        }

        container.set(RouterService, router)

        await emmitter.emitAndWait('router:registered', { router })
    }

    public async onLoad(): Promise<void> {
        const router = container.get<RouterRegister>(RouterService)

        router.addDir(serverPath('routes'), { module: 'root' })

        await RouterFileBaseRoutingService
            .create(serverPath('api'))
            .setPrefix('/api')
            .setRouter(router)
            .setModule('root')
            .load()

        await emmitter.emitAndWait('router:loaded', { router })

    }

    public async onBoot(): Promise<void> {
        const router = container.get<RouterRegister>(RouterService)

        await router.load()
    }

    public async onShutdown(): Promise<void> {
        const router = container.get<RouterRegister>(RouterService)

        router.clear()
    }
}
