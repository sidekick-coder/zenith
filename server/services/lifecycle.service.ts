import logger from '#server/facades/logger.facade.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

export class LifecycleHook {
    public id = 'lifecycle-hook'

    public async onRegister(): Promise<void> {
        // Logic to execute when the service is loaded
    }

    public async onLoad(): Promise<void> {
        // Logic to execute when the service is registered
    }

    public async onBoot(): Promise<void> {
        // Logic to execute when the service is booting
    }

    public async onShutdown(): Promise<void> {
        // Logic to execute when the service is shutting down
    }
}

export default class LifecycleService {
    public hooks: Map<string, LifecycleHook>
    public debug = false
    public logger = logger.child({ label: 'lifecycle' })

    constructor(data: Partial<LifecycleService> = {}) {
        this.debug = data.debug ?? this.debug
        this.hooks = data.hooks ?? new Map()
    }

    public add(payload: LifecycleHook | LifecycleHook[]): void {
        const hooks = Array.isArray(payload) ? payload : [payload]

        for (const hook of hooks) {
            this.hooks.set(hook.id, hook)

            if (this.debug) {
                this.logger.debug('add ' + hook.id)
            }
        }
    }

    public async register(): Promise<void> {
        for (const hook of this.hooks.values()) {
            const [error] = await tryCatch(() => hook.onRegister())
            
            if (error) {
                Object.assign(error, { hookId: hook.id })
                this.logger.error('error in hook register:', error)
                continue
            }
            
            if (this.debug) {
                this.logger.debug('register' + hook.id)
            }
        }
    }

    public async load(): Promise<void> {
        for (const hook of this.hooks.values()) {
            const [error] = await tryCatch(() => hook.onLoad())
            
            if (error) {
                Object.assign(error, { hookId: hook.id })
                this.logger.error('error in hook load:', error)
                continue
            }
            
            if (this.debug) {
                this.logger.debug('load ' + hook.id)
            }
        }
    }

    public async boot(): Promise<void> {
        for (const hook of this.hooks.values()) {
            const [error] = await tryCatch(() => hook.onBoot())
            
            if (error) {
                Object.assign(error, { hookId: hook.id })
                this.logger.error('error in hook boot:', error)
                continue
            }
            
            if (this.debug) {
                this.logger.debug('boot ' + hook.id)
            }
        }
    }

    public async shutdown(): Promise<void> {
        for (const hook of this.hooks.values()) {
            const [error] = await tryCatch(() => hook.onShutdown())
            
            if (error) {
                Object.assign(error, { hookId: hook.id })
                this.logger.error('error in hook shutdown:', error)
                continue
            }
            
            if (this.debug) {
                this.logger.debug('shutdown ' + hook.id)
            }
        }
    }

}