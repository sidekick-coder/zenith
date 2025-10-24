import { createApp } from './main'
import di from './utils/di'
import config from './facades/config.facade'
import { flatten } from '#shared/utils/flatten.ts'

export async function importDynamicModule(modulePath: string) {
    return await import(/* @vite-ignore */ modulePath + `?t=${Date.now()}`) // bust cache
}

async function main(){
    const state = (window as any).__INITIAL_STATE__ || {}
    
    di.load(state)
    di.set('logger', console) // Set a default logger, can be replaced with a proper logger later

    const modulesEnabled: string[] = di.get('modules:enabled', [])
    
    const clientSetup: any = {}
    
    for (const m of modulesEnabled) {
        const filename = `/static/modules/${m}/setup.client.js`
            
        const mod = await importDynamicModule(filename)
    
        clientSetup[filename] = mod.default
    }

    di.set('client:setups', clientSetup)

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
