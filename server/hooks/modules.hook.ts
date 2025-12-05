import di from '#server/facades/di.facade.ts'
import assets from '#server/facades/assets.facade.ts'
import scheduler from '#server/facades/scheduler.facade.ts'
import emmitter from '#server/facades/emmitter.facade.ts'
import queue from '#server/facades/queue.facade.ts'
import { LifecycleHook } from '#server/services/lifecycle.service.ts'
import modules from '#server/services/modules.service.ts'
import RouterSevice from '#server/services/router.service.ts'
import RouterRegister from '#server/services/routerRegister.service.ts'
import type { SetupServerParams } from '#server/utils/index.ts'

export default class ModulesLifecycleHook extends LifecycleHook {
    public id = 'modules'

    public async onRegister(): Promise<void> {
        
    }

    public async onLoad(): Promise<void> {
        const router = di.get<RouterRegister>(RouterSevice)

        const ctx: SetupServerParams = {
            router,
            scheduler,
            emmitter,
            assets,
            queue
        }

        await modules.load(ctx)
    }

    public async onBoot(): Promise<void> {
        
    }
}