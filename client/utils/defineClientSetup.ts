import type { UseMenu } from '#client/composables/useMenu.ts'
import type { Router } from '#client/router.ts'

interface SetupClientParams {
   router: Router
   menu: UseMenu
}

interface ClientSetupFn {
    (params: SetupClientParams): void;
}

export interface ClientSetup {
    setup: ClientSetupFn;
}

export function defineClientSetup(mod: ClientSetup | ClientSetupFn) {
    if (typeof mod === 'function') {
        return { setup: mod } as ClientSetup
    }
    
    return mod
}

