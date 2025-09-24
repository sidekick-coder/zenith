import di from './di.facade.ts'
import Router from '#server/services/router.service.ts'
import setupMiddleware from '#server/middlewares/setup.middleware.ts'
import authorizationMiddleware from '#server/middlewares/authorization.middleware.ts'
import authSilenceMiddleware from '#server/middlewares/authSilence.middleware.ts'
import type { MiddlewareHandleResult } from '#server/contracts/router.contract.ts'

type Context = MiddlewareHandleResult<[typeof authSilenceMiddleware, typeof authorizationMiddleware]>

di.set('router', new Router<Context>())

const router = di.proxy<Router<Context>>('router')

router.use(setupMiddleware, 'global')
router.use(authSilenceMiddleware, 'global')
router.use(authorizationMiddleware, 'global')

export default router
