import di from './di.facade.ts'
import EmmitterService from '#server/services/emmitter.service.ts'

const key = 'emmitter'

const service = new EmmitterService()

di.set(key, service)

const emmitter = di.proxy<EmmitterService>(key)

export default emmitter
