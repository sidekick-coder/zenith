import LoggerService from '#shared/services/logger.service.ts'
import type LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import type { Constructor } from '#shared/utils/compose.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

export default class LifecycleService {
    public hooks: Map<string, LifecycleHook>
    public logger: LoggerService
    public debug = false

    constructor(data: Partial<LifecycleService> = {}) {
        this.debug = data.debug ?? this.debug
        this.hooks = data.hooks ?? new Map()
        this.logger = data.logger ?? new LoggerService()
    }

    public list(){
        const hooks = Array.from(this.hooks.values())
        
        hooks.sort((a, b) => {
            const orderA = a.order ?? 0
            const orderB = b.order ?? 0
            return orderA - orderB
        })

        return hooks 
    }

    public add(...payload: (LifecycleHook | Constructor<LifecycleHook>)[]): void {
        const instances: LifecycleHook[] = []
        
        for (const item of payload) {
            if (typeof item === 'function') {
                instances.push(new item())
                continue
            }
            
            instances.push(item)
        }

        for (const hook of instances) {
            this.hooks.set(hook.hook_id, hook)

            if (this.debug) {
                this.logger.debug('add ' + hook.hook_id)
            }
        }
    }

    public async register(): Promise<void> {
        for (const hook of this.list()) {
            const [error] = await tryCatch(() => hook.onRegister())
            
            if (error) {
                Object.assign(error, { hookId: hook.hook_id })
                this.logger.error('error in hook register: ', error)
                continue
            }
            
            if (this.debug) {
                this.logger.debug('register ' + hook.hook_id)
            }
        }
    }

    public async load(): Promise<void> {
        for (const hook of this.list()) {
            const [error] = await tryCatch(() => hook.onLoad())
            
            if (error) {
                Object.assign(error, { hookId: hook.hook_id })
                this.logger.error('error in hook load:', error)
                continue
            }
            
            if (this.debug) {
                this.logger.debug('load ' + hook.hook_id)
            }
        }
    }

    public async boot(): Promise<void> {
        for (const hook of this.list()) {
            const [error] = await tryCatch(() => hook.onBoot())
            
            if (error) {
                Object.assign(error, { hookId: hook.hook_id })
                this.logger.error('error in hook boot:', error)
                continue
            }
            
            if (this.debug) {
                this.logger.debug('boot ' + hook.hook_id)
            }
        }
    }

    public async shutdown(): Promise<void> {
        for (const hook of this.list()) {
            const [error] = await tryCatch(() => hook.onShutdown())
            
            if (error) {
                Object.assign(error, { hookId: hook.hook_id })
                this.logger.error('error in hook shutdown:', error)
                continue
            }
            
            if (this.debug) {
                this.logger.debug('shutdown ' + hook.hook_id)
            }
        }
    }

}