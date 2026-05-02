import './translator.ts'

import './imports'
import './assets/styles.css'

import { createHead } from '@unhead/vue/client'
import type { App } from 'vue'
import di from './utils/di'
import ModulesService from './services/modules.service.ts'
import ModulesBrowserService from './services/modulesBrowser.service.ts'
import ModulesDevService from './services/modulesDev.service.ts'
import type { Router } from './router.ts'
import FetchBrowserService from './services/fetchBrowser.service.ts'
import FetchService from './services/fetch.service.ts'
import ClientLoggerService from './services/logger.service.ts'
import ConfigService from '#shared/services/config.service.ts'
import lifecycle from '#client/facades/lifecycle.facade.ts'
import LoggerService from '#shared/services/logger.service.ts'

const config = new ConfigService()
const logger = new ClientLoggerService()

di.set(ConfigService, config)
di.set(LoggerService, logger)

di.loadFromRecord(window.__CONTAINER__ || {})
config.loadFromRecord(window.__CONFIG__ || [])

di.set('state', window.__STATE__ || {})
di.set(FetchService, new FetchBrowserService())
di.set('isServer', false)

const serviceOptions = { debug: config.get('modules.debug') || config.get('app.debug') }

const useBrowserService = config.get('modules.browser.service') === 'browser' || import.meta.env.PROD

di.set(ModulesService, useBrowserService
    ? new ModulesBrowserService(serviceOptions) 
    : new ModulesDevService(serviceOptions)
)

async function main(){
    await lifecycle.register()
    
    await lifecycle.load()
    
    await lifecycle.boot()
    
    const app = di.get<App>('app')
    const router = di.get<Router>('router')
    
    const head = createHead({ init: window.__STATE__?.head ? [window.__STATE__.head] : [] })
    
    app.use(head)
    
    await router.isReady()
    
    app.mount('#app')
    
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .catch(err => console.error('sw failed:', err))
        })
    }
}



main().catch(err => {
    console.error('Error during app initialization:', err)
})
