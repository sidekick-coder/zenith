import TranslatorService from '#shared/services/translator.service.ts'

const state = globalThis.__STATE__ || {}
const locales = state['translator:locales'] || []
const locale = state['translator:locale'] || 'en-US'
const entries = state['translator:entries'] || {}
        
const service = new TranslatorService({
    locale: locale,
    // debug: config.getOne(['translator.debug', 'app.debug'], false),
    entries: new Map(Object.entries(entries)),
    // logger: logger.child({ label: 'translator' })
})
        
for (const locale of locales) {
    service.localeLoaders.set(locale, async () => {
        return {}
    })
}

// di.set(TranslatorService, service)


globalThis.$t = service.t.bind(service)
globalThis.$t = service.t.bind(service)
globalThis.$dt = service.datetime.bind(service)
globalThis.$d = service.date.bind(service)
globalThis.$translator = service


export default service
