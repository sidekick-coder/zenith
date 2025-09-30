import { tryCatch } from '#shared/utils/tryCatch.ts'
import type { Events } from '#server/contracts/events.contract.ts'

interface EmmitterHanlder {
    event: string
    listener: Function
}

export default class EmmitterService {
    private handlers: EmmitterHanlder[] = []

    public on<K extends keyof Events>(event: K, listener: (args: Events[K]) => void): void
    public on(event: string, listener: (args: any) => void): void
    public on(event: string, listener: Function) {
        this.handlers.push({
            event,
            listener 
        })
    }

    public emit<K extends keyof Events>(event: K, args: Events[K]): void
    public emit(event: string, args: any): void
    public emit(event: string, args: any) {
        const handlers = this.handlers.filter(h => h.event === event)
        
        for (const handler of handlers) {
            tryCatch.sync(() => handler.listener(args))
        }
    }

    public async emitAndWait<K extends keyof Events>(event: K, args: Events[K]): Promise<void>
    public async emitAndWait(event: string, args: any): Promise<void>
    public async emitAndWait(event: string, args: any) {
        const handlers = this.handlers.filter(h => h.event === event)

        for await (const handler of handlers) {
            await tryCatch(() => handler.listener(args))
        }
    }

    public clear() {
        this.handlers = []
    }

    public hasHandlers() {
        return this.handlers.length > 0
    }
}