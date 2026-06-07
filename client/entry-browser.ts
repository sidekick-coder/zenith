import './translator.ts'

import './imports'
import '@sidekick-coder/zenith-kit/styles'
import './assets/styles.css'

import { createHead } from '@unhead/vue/client'
import type { App } from 'vue'
import { container, LifecycleService, FetchBrowserService } from '@sidekick-coder/zenith-kit/client'
import { ConfigService, EmmitterService, LoggerService } from '@sidekick-coder/zenith-kit/shared'
import ModulesService from './services/modules.service.ts'
import ModulesBrowserService from './services/modulesBrowser.service.ts'
import ModulesDevService from './services/modulesDev.service.ts'
import type { Router } from './router.ts'
import FetchService from './services/fetch.service.ts'
import ClientLoggerService from './services/logger.service.ts'

const config = new ConfigService()
const logger = new ClientLoggerService()

container.loadFromRecord(window.__CONTAINER__ || {})
config.loadFromRecord(window.__CONFIG__ || [])

// emmitter
const emmiter = new EmmitterService({
    debug: config.getOne(['emmitter.debug', 'app.debug', 'debug'], false),
    logger: logger.child({ label: 'emmitter' }),
})

const lifecycle = new LifecycleService({
    debug: config.getOne(['lifecycle.debug', 'app.debug', 'debug'], false),
    logger: logger.child({ label: 'lifecycle' }),
})

container
    .set(ConfigService, config)
    .set(LifecycleService, lifecycle)
    .set(LoggerService, logger)
    .set(FetchService, new FetchBrowserService())
    .set(EmmitterService, emmiter)
    .set('state', window.__STATE__ || {})

lifecycle.addImports(import.meta.glob('./hooks/*.ts', { eager: true }))

const serviceOptions = { debug: config.get('modules.debug') || config.get('app.debug') }

const useBrowserService = config.get('modules.browser.service') === 'browser' || import.meta.env.PROD

container.set(ModulesService, useBrowserService
    ? new ModulesBrowserService(serviceOptions) 
    : new ModulesDevService(serviceOptions)
)

async function main(){
    await lifecycle.emit(['register', 'load', 'boot'])
    
    const app = container.get<App>('app')
    const router = container.get<Router>('router')
    
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
