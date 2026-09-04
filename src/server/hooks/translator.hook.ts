import type { PageRequestContextEntity } from '@sidekick-coder/zenith-kit/server'
import { config, container } from '@sidekick-coder/zenith-kit/server'
import { LifecycleHook, LoggerService } from '@sidekick-coder/zenith-kit/shared'
import emmitter from '#server/facades/emmitter.facade.ts'
import TranslatorService from '#server/services/translator.service.ts'

export default class TrasnlatorLifecycleHook extends LifecycleHook {
    public order = 3

    public async register(): Promise<void> {
        const logger = container.get<LoggerService>(LoggerService)

        const service = new TranslatorService({
            debug: config.getOne(['translator.debug', 'app.debug'], false),
            logger: logger.child({ label: 'translator' })
        })

        service.discover()

        globalThis.$t = service.t.bind(service)
        globalThis.$dt = service.datetime.bind(service)
        globalThis.$d = service.date.bind(service)
        globalThis.$translator = service

        container.set(TranslatorService, service)
    }

    public async onPageRequest(ctx: PageRequestContextEntity): Promise<void> {
        const service = container.get<TranslatorService>(TranslatorService)

        let locale = config.get('translator.defaultLocale', 'en-US')

        const metas = ctx.nodeState.get('user:metas') || {}

        if (metas['locale']) {
            locale = metas['locale']
        }

        ctx.setState('translator:locales', service.locales)
        ctx.setState('translator:locale', locale)
        ctx.setState('translator:entries', await service.getEntries(locale))
    }


    public async load(): Promise<void> {
        const service = container.get<TranslatorService>(TranslatorService)
        const defaultLocale = config.get('translator.defaultLocale', 'en-US')

        await service.load(defaultLocale)

        emmitter.on('page:request:start', ctx => this.onPageRequest(ctx))
    }
}
