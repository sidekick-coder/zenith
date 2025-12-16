import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import di from '#client/utils/di.ts'
import config from '#client/facades/config.facade.ts'
import TranslatorService from '#shared/services/translator.service.ts'
import logger from '#client/facades/logger.facade.ts'

export default class TranslatorLifecycleHook extends LifecycleHook {
    public async onRegister(): Promise<void> {
        const state = di.get<Record<string, any>>('state')
        const locales = state['translator:locales'] || []
        const locale = state['translator:locale'] || 'en-US'
        const entries = state['translator:entries'] || {}
        
        const service = new TranslatorService({
            locale: locale,
            debug: config.getOne(['translator.debug', 'app.debug'], false),
            entries: new Map(Object.entries(entries)),
            logger: logger.child({ label: 'translator' })
        })
        
        for (const locale of locales) {
            service.localeLoaders.set(locale, async () => {
                return {}
            })
        }

        di.set(TranslatorService, service)


        globalThis.$t = service.t.bind(service)
    }
}
