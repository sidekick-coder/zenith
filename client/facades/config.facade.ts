import ConfigService from '#shared/services/config.service.ts'

const config = new ConfigService()

globalThis.config = config

export default config