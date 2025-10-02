import di from './di.facade.ts'
import config from './config.facade.ts'
import EncryptService from '#server/services/encrypt.service.ts'

const key = 'encrypt'

di.set(key, new EncryptService(config.get('app.key')))

const encrypt = di.proxy<EncryptService>(key)

export default encrypt