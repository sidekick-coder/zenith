import type { Constructor } from '#shared/utils/compose.ts'

export async function emitHook(constructor: any, event: string, ...args: any[]) {                
    const listeners = constructor.listeners || []

    for await (const l of listeners.filter((l: any) => l.event === event)) {
        await l.listener(...args)
    }
}

export function onHook(constructor: any, event: string, listener: (...args: any[]) => void) {
    const listeners = constructor.listeners || []

    const exists = listeners.find((l: any) => l.event === event && l.listener === listener)

    if (exists) {
        return
    }

    listeners.push({ 
        event,
        listener 
    })

    constructor.listeners = listeners
}

export function Hooks<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
        constructor(...args: any[]) {
            super(...args)
                
            if (typeof (this.constructor as any).boot === 'function') {
                (this.constructor as any).boot.apply(this.constructor)
            }
        }

        public static listeners = [] as Array<(...args: any[]) => void>

        public static on(event: string, listener: (...args: any[]) => void) {
            return onHook(this, event, listener)
        }

        public static async emit(event: string, ...args: any[]) {
            return emitHook(this, event, ...args)
        }
    }
}