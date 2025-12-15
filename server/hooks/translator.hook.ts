import config from '#server/facades/config.facade.ts'
import di from '#server/facades/di.facade.ts'
import TranslatorService from '#server/services/translator.service.ts'
import ViteService from '#server/services/vite.service.ts'
import type { ViteServiceEvents } from '#server/services/vite.service.ts'
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
        
        globalThis.$t = service.t.bind(service)

        di.set(TranslatorService, service)
    }

    public async onLoad(): Promise<void> {
        const service = di.get<TranslatorService>(TranslatorService)
        const vite = di.get<ViteService>(ViteService)
        const defaultLocale = config.get('translator.defaultLocale', 'en-US')

        await service.load(defaultLocale)

        vite.on('vite:before-render', async ({ state }: ViteServiceEvents['vite:before-render']) => {
            let locale = config.get('translator.defaultLocale', 'en-US')
            const metas = state.get('user:metas')

            if (metas['locale']) {
                locale = metas['locale']
            }

            state.set('translator:locales', service.locales)
            state.set('translator:locale', locale)
            state.set('translator:entries', await service.getEntries(locale))

            console.log('Translator entries loaded for locale:', locale)
        })
    }
}