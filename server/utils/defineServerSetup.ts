import type Router from '#server/services/router.service.ts'
import type EmmitterService from '#server/services/emmitter.service.ts'
import type ScheduleService from '#server/services/schedule.service.ts'
import AssetsService from '#server/services/assets.service.ts'

interface SetupServerParams {
   router: Router
   scheduler: ScheduleService
   emmitter: EmmitterService
   assets: AssetsService
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

