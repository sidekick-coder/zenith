import type { Router } from '#client/router.ts'

interface SetupClientParams {
   router: Router
}

interface ClientSetupFn {
    (params: SetupClientParams): void;
}

interface ClientSetup {
    setup: ClientSetupFn;
}

export function defineClientSetup(mod: ClientSetup | ClientSetupFn) {
    if (typeof mod === 'function') {
        return { setup: mod } as ClientSetup
    }
    
    return mod
}

