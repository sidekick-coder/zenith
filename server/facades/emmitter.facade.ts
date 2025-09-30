import di from './di.facade.ts'
import EmmitterService from '#server/services/emmitter.service.ts'

const key = 'emmitter'

di.set(key, new EmmitterService())

const emmitter = di.proxy<EmmitterService>(key)

export default emmitter
