import { createHead } from '@unhead/vue/client'
import type { App } from 'vue'
import di from './utils/di'
import ModulesService from './services/modules.service.ts'
import ModulesBrowserService from './services/modulesBrowser.service.ts'
import ModulesDevService from './services/modulesDev.service.ts'
import type { Router } from './router.ts'
import FetchBrowserService from './services/fetchBrowser.service.ts'
import FetchService from './services/fetch.service.ts'
import config from '#client/facades/config.facade'
import lifecycle from '#client/facades/lifecycle.facade.ts'
import './imports'
import './assets/styles.css'

di.loadFromRecord(window.__CONTAINER__ || {})
config.loadFromRecord(window.__CONFIG__ || [])

di.set('state', window.__STATE__ || {})
di.set(FetchService, new FetchBrowserService())
di.set('isServer', false)

const serviceOptions = {
    debug: config.get('modules.debug') || config.get('app.debug')
}

const useBrowserService = config.get('modules.browser.service') === 'browser' || import.meta.env.PROD

di.set(ModulesService, useBrowserService
    ? new ModulesBrowserService(serviceOptions) 
    : new ModulesDevService(serviceOptions)
)

await lifecycle.register()

await lifecycle.load()

await lifecycle.boot()

const app = di.get<App>('app')

const head = createHead({
    init: window.__STATE__?.head ? [window.__STATE__.head] : []
})


app.use(head)

app.mount('#app')

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .catch(err => console.error('sw failed:', err))
    })
}
