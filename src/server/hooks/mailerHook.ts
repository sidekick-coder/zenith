import container from '@sidekick-coder/zenith-kit/server/facades/container'
import config from '@sidekick-coder/zenith-kit/server/facades/config'
import logger from '@sidekick-coder/zenith-kit/server/facades/logger'
import LifecycleHook from '@sidekick-coder/zenith-kit/shared/entities/LifecycleHook'
import MailerService from '#server/services/mailer.service.ts'

export default class extends LifecycleHook {
    public order = 3

    public async register(): Promise<void> {
        const mailer = new MailerService({
            debug: config.getOne(['mailer.debug', 'app.debug'], false),
            logger: logger.child({ label: 'mailer' }),
        })
        
        container.set(MailerService, mailer)

        const mod = (await import('#server/gateways/mailerSmtp.gateway.ts'))

        mailer.addGateway('smtp', mod.default || mod)
    }

    public async load(): Promise<void> {
        const mailer = container.get<MailerService>(MailerService)

        await mailer.load()
    }
}
