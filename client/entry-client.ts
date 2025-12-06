import di from './utils/di'
import ModulesService from './services/modules.service.ts'
import ModulesBrowserService from './services/modulesBrowser.service.ts'
import ModulesDevService from './services/modulesDev.service.ts'
import config from '#client/facades/config.facade'
import lifecycle from '#client/facades/lifecycle.facade.ts'
import type LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import './imports'
import './assets/styles.css'

di.load(window.__INITIAL_STATE__ || {})
di.set('isServer', false)
config.loadEntries(window.__CONFIG__ || [])

const serviceOptions = {
    debug: config.get('modules.debug') || config.get('app.debug')
}

di.set(ModulesService, import.meta.env.DEV 
    ? new ModulesDevService(serviceOptions) 
    : new ModulesBrowserService(serviceOptions)
)

const hooks = Object.values<any>(import.meta.glob('./hooks/**/*.hook.ts', { eager: true }))
    .map(hook => hook.default || hook) as LifecycleHook[]

lifecycle.add(...hooks)




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
