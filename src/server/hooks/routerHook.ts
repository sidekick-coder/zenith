import { LifecycleHook } from '@sidekick-coder/zenith-kit/shared'
import { emmitter, config, container, RouterService, serverPath, logger, RouterFileBaseRoutingService } from '@sidekick-coder/zenith-kit/server'
import RouterRegister from '#server/services/routerRegister.service.ts'
import setupMiddleware from '#server/middlewares/setup.middleware.ts'
import authSilenceMiddleware from '#server/middlewares/authSilence.middleware.ts'
import authorizationMiddleware from '#server/middlewares/authorization.middleware.ts'

export default class extends LifecycleHook {
    public order = 97
    public hook_aliases = ['router']

    public async onRegister(): Promise<void> {
        const router = new RouterRegister({
            debug: config.getOne(['router.debug', 'app.debug', 'debug'], false),
            logger: logger.child({ label: 'router' })
        })

        const needSetup = config.getOne(['setup.need_database', 'setup.need_users'], false)

        if (needSetup) {
            router.logger.warn('setup is required, setup middleware is enabled')
            router.use(setupMiddleware, 'global')
        }

        if (!needSetup) {
            router.logger.info('setup is not required, auth and authorization middleware is enabled')

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
            .setDebug(true)
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
