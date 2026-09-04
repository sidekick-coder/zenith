import { container, emmitter, config, logger, env, HttpService, RouterService } from '@sidekick-coder/zenith-kit/server'
import { LifecycleHook } from '@sidekick-coder/zenith-kit/shared'
import RouterRegister from '#server/services/routerRegister.service.ts'

export default class extends LifecycleHook {
    public order = 99
    public hook_aliases = ['http']

    public async onRegister(): Promise<void> {
        const router = container.get<RouterRegister>(RouterService)

        const http = new HttpService({
            logger: logger,
            router: router,
            emmitter: emmitter,
            env: env,
            debug: config.getOne(['http.debug', 'app.debug'], false),
        })

        const origins = config.get('cors.origins', '')
            .split(',')
            .map((o: string) => o.trim())
            .filter((o: string) => o.length > 0)

        http.cors({
            credentials: true,
            origin: origins.length > 0 ? origins : undefined,
        })

        container.set(HttpService, http)

        await emmitter.emitAndWait('http:registered', { http })
    }

    public async onLoad(): Promise<void> {
        const http = container.get<HttpService>(HttpService)
        const router = container.get<RouterRegister>(RouterService)

        http.router = router
        http.routes()

        await emmitter.emitAndWait('http:loaded', { http })
    }

    public async onBoot(): Promise<void> {
        const http = container.get<HttpService>(HttpService)

        http.start()

        await emmitter.emitAndWait('http:booted', { http })
    }

    public async onShutdown(): Promise<void> {
        const http = container.get<HttpService>(HttpService)

        await http.stop()

        await emmitter.emitAndWait('http:shutdown', { http })
    }
}
