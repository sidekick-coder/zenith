import emmitter from '@sidekick-coder/zenith-kit/server/facades/emmitter'
import LoggerService from '@sidekick-coder/zenith-kit/shared/services/LoggerService'
import type { EmmitterListenerOptions, EmmitterListener } from '@sidekick-coder/zenith-kit/shared/services/EmmitterService'
import template from 'lodash-es/template.js'
import webhookSenderRepository from '#server/facades/webhookSenderRepository.ts'
import type { WebhookSender } from '#shared/schemas/webhookSenderSchema.ts'

export interface WebhookSenderManagerExecuteOptions {
    webhookSender: WebhookSender
    eventData: any
    eventOptions: EmmitterListenerOptions
}

export interface WebhookSenderManagerLoadedEntry {
    id: string
    events: string[]
    cb: EmmitterListener
}

export default class WebhookSenderManager {
    public static __container_entry_key = 'WebhookSenderManager'
    public debug: boolean = false
    public logger = new LoggerService()
    public loadedSenders: Map<string, WebhookSenderManagerLoadedEntry>

    constructor() {
        this.loadedSenders = new Map()
    }

    public static create() {
        return new WebhookSenderManager()
    }

    public setDebug(debug: boolean) {
        this.debug = debug
        return this
    }

    public setLogger(logger: LoggerService) {
        this.logger = logger
        return this
    }

    public async execute(options: WebhookSenderManagerExecuteOptions) {
        const sender = options.webhookSender
        const eventData = options.eventData
        const eventOptions = options.eventOptions

        let body = undefined

        if (sender.request_body) {
            const json = typeof sender.request_body === 'string' ? sender.request_body : JSON.stringify(sender.request_body)

            console.log('Executing webhook sender with body template:', json)

            const compiled = template(json, { interpolate: /{{([\s\S]+?)}}/g })

            body = compiled({
                data: eventData,
                event: eventOptions,
            })
        }

        const fetchOptions: RequestInit = {
            method: sender.request_method,
            headers: sender.request_headers,
            body: ['PUT', 'POST'].includes(sender.request_method || 'GET') ? body : undefined,
        }

        const [error, response] = await $try(() => fetch(sender.request_url, fetchOptions))

        if (error) {
            Object.assign(error, {
                sender_id: sender.id,
                sender_name: sender.name,
                url: sender.request_url,
                method: sender.request_method,
            })

            return this.logger.error('failed to send webhook', error)
        }

        if (this.debug) {
            this.logger.debug('sent webhook', {
                request_url: sender.request_url,
                request_method: fetchOptions.method,
                request_headers: fetchOptions.headers,
                request_body: fetchOptions.body ? JSON.parse(fetchOptions.body as string) : undefined,
                response_status: response.status,
                response_text: response.status >= 400 ? await response.text() : undefined,
            })
        }
    }

    public async unloadWebhookSender(sender: WebhookSender) {
        const entry = this.loadedSenders.get(sender.id)

        if (!entry) return

        for (const e of entry.events) {
            emmitter.off(e, entry.cb)
        }

        this.loadedSenders.delete(sender.id)

        if (this.debug) {
            this.logger.debug('unloaded webhook sender', {
                id: sender.id,
                name: sender.name,
                events: entry.events,
            })
        }
    }

    public async loadWebhookSender(hook: WebhookSender) {
        const cb = (...args: any[]) => this.execute({
            webhookSender: hook,
            eventData: args[0] || {},
            eventOptions: args[1] || {},
        })

        for (const e of hook.trigger_events) {
            emmitter.on(e, cb)
        }

        this.loadedSenders.set(hook.id, {
            id: hook.id,
            events: hook.trigger_events,
            cb,
        })

        if (this.debug) {
            this.logger.debug('loaded webhook', {
                id: hook.id,
                name: hook.name,
                trigger_events: hook.trigger_events,
            })
        }
    }

    public async load() {
        let senders = await webhookSenderRepository.findMany()

        senders = senders.filter(sender => sender.enabled)

        for (const sender of senders) {
            await this.loadWebhookSender(sender)
        }

        return this
    }

}
