import { createApp } from './main'
import di from './utils/di'
import config from './facades/config.facade'
import { flatten } from '#shared/utils/flatten.ts'

async function main(){
    const state = (window as any).__INITIAL_STATE__ || {}
    
    di.load(state)
    di.set('logger', console) // Set a default logger, can be replaced with a proper logger later

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
