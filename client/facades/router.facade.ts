import di from '#client/utils/di.ts'
import type { Router } from '#client/router.ts'

const router = di.proxy<Router>('router')

export default router
