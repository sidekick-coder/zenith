import { createApp } from './main'
import di from './utils/di'
import config from './facades/config.facade'
import { flatten } from '#shared/utils/flatten.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

export async function importDynamicModule(modulePath: string) {
    const [error, mod] = await tryCatch(async () => await import(/* @vite-ignore */ modulePath + `?t=${Date.now()}`)) // bust cache

    if (error) return null

    return mod
}

async function main(){
    const state = (window as any).__INITIAL_STATE__ || {}
    
    di.load(state)
    di.set('logger', console) // Set a default logger, can be replaced with a proper logger later
    di.set('isServer', false)

    for (const [key, value] of Object.entries(flatten(state.config || {}))) {
        config.entries.set(key, {
            key,
            value,
            source: 'state'
        })
    }

    const { app, router } = await createApp()
    
    await router.isReady()
    
    app.mount('#app')
}

main()

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('sw registered'))
            .catch(err => console.error('sw failed:', err))
    })
}
