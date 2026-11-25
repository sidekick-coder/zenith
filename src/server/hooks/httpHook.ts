import container from '@sidekick-coder/zenith-kit/server/facades/container'
import emmitter from '@sidekick-coder/zenith-kit/server/facades/emmitter'
import config from '@sidekick-coder/zenith-kit/server/facades/config'
import logger from '@sidekick-coder/zenith-kit/server/facades/logger'
import router from '@sidekick-coder/zenith-kit/server/facades/router'
import env from '@sidekick-coder/zenith-kit/server/facades/env'
import HttpService from '@sidekick-coder/zenith-kit/server/services/HttpService'
import LifecycleHook from '@sidekick-coder/zenith-kit/shared/entities/LifecycleHook'

export default class extends LifecycleHook {
    public order = 99
    public hook_aliases = ['http']

    public async onRegister(): Promise<void> {
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
