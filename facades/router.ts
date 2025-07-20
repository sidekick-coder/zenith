import di from './di.ts'
import Router from '#router/router.ts'

di.set('router', Router)

const router = di.proxy<Router>('router')

export default router