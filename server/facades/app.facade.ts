import di from './di.facade.ts'
import ExpressService from '#server/services/express.service.ts'

const app = di.proxy<ExpressService>(ExpressService)

export default app