import di from './di.facade.ts'
import EncryptService from '#server/services/encrypt.service.ts'

const key = 'encrypt'

di.set(key, new EncryptService())

const encrypt = di.proxy<EncryptService>(key)

export default encrypt