import { createApp } from './main'
import di from './utils/di'

async function main(){
    const state = (window as any).__INITIAL_STATE__ || {}
    
    di.load(state)

    const { app, router } = await createApp()
    
    await router.isReady()
    
    app.mount('#app')
}

main()