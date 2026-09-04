import { tryCatch } from '@sidekick-coder/zenith-kit/shared/utils/tryCatch'
import config from '@sidekick-coder/zenith-kit/server/facades/config'
import BaseException from '#server/exceptions/base.ts'
import LoggerService from '#shared/services/logger.service.ts'
import type BaseMailer from '#server/gateways/mailerBase.gateway.ts'
import MailerConfig from '#server/entities/mailerConfig.entity.ts'
import type { MailerSendPayload } from '#server/gateways/mailerBase.gateway.ts'

export default class MailerService {
    public static __container_entry_key = 'MailerService'

    public gateways: Map<string, typeof BaseMailer> = new Map()
    public instances: Map<string, BaseMailer> = new Map()
    public selectedGateway?: string
    public defaultGateway?: string
    public debug = false
    public logger: LoggerService

    public get current() {
        if (!this.selectedGateway) return null
        
        const selected = this.instances.get(this.selectedGateway)

        return selected || null
    }

    constructor(data: Partial<MailerService> = {}) {
        this.selectedGateway = data.selectedGateway
        this.debug = data.debug !== undefined ? data.debug : false
        this.logger = data.logger || new LoggerService()
        this.selectedGateway = data.selectedGateway || undefined

        if (this.debug) {
            this.logger.debug('initialized in debug mode')
        }
    }

    public addGateway(type: string, gateway: typeof BaseMailer) {
        this.gateways.set(type, gateway)
    }

    public get(name: string) {
        return this.instances.get(name) || null
    }

    private instantiate(config: MailerConfig) {
        const gateway = this.gateways.get(config.type)

        if (!gateway) {
            throw new BaseException('Gateway not found')
        }

        return new gateway(config)
    }

    public async load(data: Partial<MailerService> = {}){
        this.debug = data.debug !== undefined ? data.debug : this.debug
        this.logger = data.logger || this.logger
        this.defaultGateway= config.get('mailer.default', null)
        this.selectedGateway = this.defaultGateway

        const configs = await MailerConfig.list()

        for (const c of configs) {
            const gateway = this.gateways.get(c.type)

            if (!gateway) {
                this.logger.warn(`Mailer gateway for type "${c.type}" not found`)
                continue
            }

            const [error, instance] = await tryCatch(() => this.instantiate(c))

            if (error) {
                this.logger.error('Failed to instantiate mailer gateway', error)
                continue
            }

            this.instances.set(c.id, instance)

            if (this.debug) {
                this.logger.debug('mailer loaded', {
                    id: c.id,
                    type: c.type,
                })
            }
        }
    }

    public use(name?: string) {
        if (!this.gateways.has(name || '')) {
            throw new BaseException('Gateway not found')
        }
        
        return new MailerService({ 
            selectedGateway: name,
            instances: this.instances,
            gateways: this.gateways,
            debug: this.debug,
            logger: this.logger
        })
    }

    public async send(payload: MailerSendPayload){
        const gateway = this.current

        if (!gateway) {
            throw new BaseException('No mailer gateway selected')
        }


        const [error, result] = await tryCatch(() => this.current!.send(payload))

        if (error) {
            Object.assign(error, { payload })
            this.logger.error('Failed to send email', error)
            throw error
        }

        return result
    }
}
