import type { App } from 'vue'
import di from '#client/utils/di.ts'

const app = di.proxy<App>('app')

export default app
