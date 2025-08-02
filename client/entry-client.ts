import { createApp } from './main'
import di from './utils/di'

const state = (window as any).__INITIAL_STATE__ || {}

di.load(state)


const { app, router } = createApp()

await router.isReady()

app.mount('#app')

