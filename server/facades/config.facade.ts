import ConfigService from '#server/services/config.service.ts'

const config = new ConfigService()

config.load()

export default config