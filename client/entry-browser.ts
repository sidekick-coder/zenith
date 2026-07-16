import { createHead } from '@unhead/vue/client'
import type { App } from 'vue'
import { container, FetchService, FetchBrowserService } from '@sidekick-coder/zenith-kit/client'
import type { Router } from './router.ts'
import ClientLoggerService from './services/logger.service.ts'
import { createApp } from './app.ts'

async function main(){
    const { lifecycle } = await createApp({
        logger: new ClientLoggerService(),
        configEntries: window.__CONFIG__ || [],
        containerEntries: window.__CONTAINER__ || {},
    })

    container
        .set(FetchService, new FetchBrowserService())
        .set('state', window.__STATE__ || {})

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
