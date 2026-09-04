import di from './di.facade.ts'
import HashService from '#server/services/hash.service.ts'

di.set(HashService, new HashService())

const hasher = di.proxy<HashService>(HashService)

export default hasher
