import type Router from '#server/router/router.ts'

interface SetupServerParams {
   router: Router
}

interface ServerSetupFn {
    (params: SetupServerParams): void;
}

interface ServerSetup {
    setup: ServerSetupFn;
}

export function defineServerSetup(mod: ServerSetup | ServerSetupFn) {
    if (typeof mod === 'function') {
        return { setup: mod } as ServerSetup
    }
    
    return mod
}

