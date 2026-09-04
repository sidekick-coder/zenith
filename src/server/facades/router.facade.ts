import di from './di.facade.ts'
import RouterService from '#server/services/router.service.ts'
import authorizationMiddleware from '#server/middlewares/authorization.middleware.ts'
import authSilenceMiddleware from '#server/middlewares/authSilence.middleware.ts'
import type { MiddlewareHandleResult } from '#server/contracts/router.contract.ts'

type Context = MiddlewareHandleResult<[typeof authSilenceMiddleware, typeof authorizationMiddleware]>

const router = di.proxy<RouterService<Context>>(RouterService)

export default router
