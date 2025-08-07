import type Router from '#server/router/router.ts'
import type ScheduleService from '#server/services/schedule.service.ts'

interface SetupServerParams {
   router: Router
   scheduler: ScheduleService
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

