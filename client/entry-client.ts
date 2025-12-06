import di from './utils/di'
import config from '#client/facades/config.facade'
import lifecycle from '#client/facades/lifecycle.facade.ts'
import type LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'

const state = (window as any).__INITIAL_STATE__ || {}

di.load(state)
di.set('isServer', false)

const hooks = Object.values<any>(import.meta.glob('./hooks/**/*.hook.ts', { eager: true }))
    .map(hook => hook.default || hook) as LifecycleHook[]

lifecycle.add(...hooks)


for (const [key, value] of Object.entries(state.config || {})) {
    config.entries.set(key, {
        key,
        value,
        source: 'state'
    })
}

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
