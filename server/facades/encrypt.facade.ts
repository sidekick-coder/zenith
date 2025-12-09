import di from './di.facade.ts'
import config from './config.facade.ts'
import EncryptService from '#server/services/encrypt.service.ts'

const key = 'encrypt'

di.set(key, new EncryptService())

const encrypt = di.proxy<EncryptService>(key)

encrypt.load({
    key: config.get('app.key', 'zenith'),
    debug: config.getOne<boolean>(['app.debug', 'encrypt.debug'], false),
})

export default encrypt