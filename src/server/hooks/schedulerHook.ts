import config from '@sidekick-coder/zenith-kit/server/facades/config'
import container from '@sidekick-coder/zenith-kit/server/facades/container'
import SchedulerService from '@sidekick-coder/zenith-kit/server/services/SchedulerService'
import { serverPath } from '@sidekick-coder/zenith-kit/server/utils/basePath'
import LifecycleHook from '@sidekick-coder/zenith-kit/shared/entities/LifecycleHook'
import emmitter from '#server/facades/emmitter.facade.ts'
import logger from '#server/facades/logger.facade.ts'

export default class extends LifecycleHook {
    public order = 3
    public hook_aliases = ['scheduler']

    public async register(){
        const scheduler = new SchedulerService({
            logger: logger.child({ label: 'scheduler' }),
            debug: config.getOne(['seeder.debug', 'app.debug', 'debug'], false),
        })

        scheduler.addDir(serverPath('routines'))

        container.set(SchedulerService, scheduler)

        await emmitter.emitAndWait('scheduler:registered', { scheduler })
    }

    public async load(){
        const scheduler = container.get<SchedulerService>(SchedulerService)

        await scheduler.load()

        await emmitter.emitAndWait('scheduler:loaded', { scheduler })
    }

    public async boot(){
        const scheduler = container.get<SchedulerService>(SchedulerService)

        await scheduler.boot()

        await emmitter.emitAndWait('scheduler:booted', { scheduler })
    }

    public async onShutdown(): Promise<void> {
        const scheduler = container.get<SchedulerService>(SchedulerService)

        await scheduler.shutdown()

        await emmitter.emitAndWait('scheduler:shutdowned', { scheduler })
    }
}
