import { createApp } from './main'
import di from './utils/di'
import RouterLifecycleHook from './hooks/router.hook.ts'
import AppLifecycleHook from './hooks/app.hook.ts'
import AuthLifecycleHook from './hooks/auth.hook.ts'
import config from '#client/facades/config.facade'
import lifecycle from '#client/facades/lifecycle.facade.ts'
import router from '#client/facades/router.facade.ts'
import app from '#client/facades/app.facade.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

const state = (window as any).__INITIAL_STATE__ || {}

di.load(state)
di.set('isServer', false)

for (const [key, value] of Object.entries(state.config || {})) {
    config.entries.set(key, {
        key,
        value,
        source: 'state'
    })
}

lifecycle.add(
    RouterLifecycleHook,
    AppLifecycleHook,
    AuthLifecycleHook
)

await lifecycle.register()

await lifecycle.load()

await lifecycle.boot()


// export async function importDynamicModule(modulePath: string) {
//     const [error, mod] = await tryCatch(async () => await import(/* @vite-ignore */ modulePath + `?t=${Date.now()}`)) // bust cache

//     if (error) return null

//     return mod
// }

// async function main(){
//     const state = (window as any).__INITIAL_STATE__ || {}
    
//     di.load(state)
//     di.set('logger', console) // Set a default logger, can be replaced with a proper logger later
//     di.set('isServer', false)

//     for (const [key, value] of Object.entries(state.config || {})) {
//         config.entries.set(key, {
//             key,
//             value,
//             source: 'state'
//         })
//     }

//     const { app, router } = await createApp()
    
//     await router.isReady()
    
//     app.mount('#app')
// }

// main()

// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//         navigator.serviceWorker.register('/sw.js')
//             .catch(err => console.error('sw failed:', err))
//     })
// }
