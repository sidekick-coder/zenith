import { LoggerService, TranslatorService } from '@sidekick-coder/zenith-kit/shared'

export interface TranslatorServicePayload {
    locales?: string[]
    locale?: string
    entries?: Record<string, string>
    logger?: LoggerService
    debug?: boolean
}

export function createTranslatorService(payload: TranslatorServicePayload): TranslatorService {
    const locales = payload.locales || ['en-US']
    const locale = payload.locale || locales[0] || 'en-US'
    const entries = payload.entries || {}

    const service = new TranslatorService({
        locale: locale,
        debug: payload.debug,
        entries: new Map(Object.entries(entries)),
        logger: payload.logger
    })

    for (const locale of locales) {
        service.localeLoaders.set(locale, async () => {
            return {}
        })
    }

    globalThis.$t = service.t.bind(service)
    globalThis.$t = service.t.bind(service)
    globalThis.$dt = service.datetime.bind(service)
    globalThis.$d = service.date.bind(service)
    globalThis.$translator = service

    return service
}

