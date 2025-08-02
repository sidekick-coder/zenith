import di from './di.ts'
import Router from '#router/router.ts'
import setupMiddleware from '#router/middlewares/setup.middleware.ts'

di.set('router', new Router())

const router = di.proxy<Router>('router')

router.use(setupMiddleware, 'global')

export default router
