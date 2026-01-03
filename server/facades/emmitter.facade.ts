import di from './di.facade.ts'
import EmmitterService from '#server/services/emmitter.service.ts'

const service = new EmmitterService()

di.set(EmmitterService, service)

const emmitter = di.proxy<EmmitterService>(EmmitterService)

export default emmitter
