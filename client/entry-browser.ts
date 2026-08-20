import './imports'
import './assets/styles.css'
import { createHead } from '@unhead/vue/client'
import ClientLoggerService from './services/logger.service.ts'

async function main() {
    const { createApp } = await import('./app.ts')
    const { container, FetchService, FetchBrowserService } = await import('@sidekick-coder/zenith-kit/client')

    container
        .set(FetchService, new FetchBrowserService())
        .set('state', window.__STATE__ || {})

    const { app, router } = await createApp({
        logger: new ClientLoggerService(),
        configEntries: window.__CONFIG__ || [],
        containerEntries: window.__CONTAINER__ || {},
    })

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
