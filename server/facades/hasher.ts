import di from './di.ts'
import HashService from '#server/services/hash.service.ts'

di.set(HashService.DI_KEY, new HashService())

const hasher = di.proxy<HashService>(HashService.DI_KEY)

export default hasher
