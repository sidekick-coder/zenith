import di from './di.facade.ts'
import ConfigService from '#shared/services/config.service.ts'

const config = di.proxy<ConfigService>(ConfigService)

export default config