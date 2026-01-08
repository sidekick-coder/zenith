import config from '#server/facades/config.facade.ts'
import di from '#server/facades/di.facade.ts'
import logger from '#server/facades/logger.facade.ts'
import MailerService from '#server/services/mailer.service.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'

export default class MailerLifecycleHook extends LifecycleHook {
    public order = 3
    public async onRegister(): Promise<void> {
        const service = new MailerService({
            debug: config.getOne(['mailer.debug', 'app.debug'], false),
            logger: logger.child({ label: 'mailer' }),
        })
        
        di.set(MailerService, service)

        service.addGateway('smtp', (await import('#server/gateways/mailerSmtp.gateway.ts')).default)        
    }

    public async onLoad(): Promise<void> {
        const mailer = di.get<MailerService>(MailerService)

        await mailer.load()
    }

    public async onBoot(): Promise<void> {
        
    }
}