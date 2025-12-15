import config from '#server/facades/config.facade.ts'
import di from '#server/facades/di.facade.ts'
import TranslatorService from '#server/services/translator.service.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import LoggerService from '#shared/services/logger.service.ts'

export default class TrasnlatorLifecycleHook extends LifecycleHook {
    public async onRegister(): Promise<void> {
        const logger = di.get<LoggerService>(LoggerService)

        const service = new TranslatorService({
            debug: config.getOne(['translator.debug', 'app.debug'], false),
            logger: logger.child({ label: 'translator' })
        })

        service.discover()

        service.load(config.get('translator.defaultLocale', 'en'))
        
        globalThis.$t = service.t.bind(service)

        di.set(TranslatorService, service)
    }
}