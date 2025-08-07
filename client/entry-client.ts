import { createApp } from './main'
import di from './utils/di'

async function main(){
    const state = (window as any).__INITIAL_STATE__ || {}
    
    di.load(state)
    di.set('logger', console) // Set a default logger, can be replaced with a proper logger later

    const { app, router } = await createApp()
    
    await router.isReady()
    
    app.mount('#app')
}

main()
