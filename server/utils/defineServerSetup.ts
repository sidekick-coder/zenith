import type Router from '#server/services/router.service.ts'
import type EmmitterService from '#server/services/emmitter.service.ts'
import type ScheduleService from '#server/services/schedule.service.ts'
import AssetsService from '#server/services/assets.service.ts'
import QueueService from '#server/services/queue.service.ts'
import type RouterRegister from '#server/services/routerRegister.service.ts'

export interface SetupServerParams {
   router: RouterRegister
   scheduler: ScheduleService
   emmitter: EmmitterService
   assets: AssetsService
   queue: QueueService
}

interface ServerSetupFn {
    (params: SetupServerParams): void | Promise<void>
}

export interface ServerSetup {
    setup: ServerSetupFn;
}

export function defineServerSetup(mod: ServerSetup | ServerSetupFn) {
    if (typeof mod === 'function') {
        return { setup: mod } as ServerSetup
    }
    
    return mod
}

