import { tryCatch } from '#shared/utils/tryCatch.ts'
import type { Events } from '#server/contracts/events.contract.ts'
import { createId } from '#client/utils/createId.ts'
import logger from '#server/facades/logger.facade.ts'

interface EmmitterHanlder {
    id: string
    event: string
    listener: Function
}

interface OnOptions {
    id?: string
    unique?: boolean
}

export interface EmmitterServiceOptions {
    debug?: boolean
}

export default class EmmitterService {
    private handlers: EmmitterHanlder[] = []
    private debug: boolean
    private logger = logger.child({ label: 'emmitter' })

    public load(options?: EmmitterServiceOptions) {
        this.debug = options?.debug || false
        
        if (this.debug) {
            this.logger.debug('emmitter loaded with debug mode enabled')
        }
    }

    public on<K extends keyof Events>(event: K, listener: (args: Events[K]) => void, options?: OnOptions): EmmitterHanlder
    public on(event: string, listener: (args: any) => void, options?: OnOptions): EmmitterHanlder
    public on(event: string, listener: Function, options?: OnOptions) {
        const id = options?.id || createId()

        if (options?.unique) {
            const exists = this.handlers.some(h => h.event === event && h.listener === listener)
            
            if (exists) {
                return
            }
        }

        const handler: EmmitterHanlder = {
            id,
            event,
            listener 
        }

        this.handlers.push(handler)

        if (this.debug) {
            this.logger.debug('handler added', handler)
        }

        return handler
    }

    public emit<K extends keyof Events>(event: K, args: Events[K]): void
    public emit(event: string, args: any): void
    public emit(event: string, args: any) {

        if (this.debug) {
            this.logger.debug('emitting event', { 
                event, 
                args
            })
        }
        
        const handlers = this.handlers.filter(h => h.event === event)
        
        for (const handler of handlers) {
            tryCatch.sync(() => handler.listener(args))
        }
    }

    public async emitAndWait<K extends keyof Events>(event: K, args: Events[K]): Promise<void>
    public async emitAndWait(event: string, args: any): Promise<void>
    public async emitAndWait(event: string, args: any) {
       

        const handlers = this.handlers.filter(h => h.event === event)

        if (this.debug) {
            this.logger.debug('emitting event', { 
                handlers: handlers.length,
                event, 
                args
            })
        }

        for await (const handler of handlers) {
            await handler.listener(args)
        }
    }

    public list() {
        return this.handlers
    }

    public remove(payload: string | string[]) {
        const ids = Array.isArray(payload) ? payload : [payload]

        this.handlers = this.handlers.filter(h => !ids.includes(h.id))

        if (this.debug) {
            this.logger.debug('handlers removed', { ids })
        }
    }

    public clear() {
        this.handlers = []

        if (this.debug) {
            this.logger.debug('all handlers cleared')
        }
    }

    public hasHandlers() {
        return this.handlers.length > 0
    }
}