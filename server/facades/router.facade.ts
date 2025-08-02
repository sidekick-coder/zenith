import di from './di.facade.ts'
import Router from '#server/router/router.ts'
import setupMiddleware from '#server/router/middlewares/setup.middleware.ts'

di.set('router', new Router())

const router = di.proxy<Router>('router')

router.use(setupMiddleware, 'global')

export default router
