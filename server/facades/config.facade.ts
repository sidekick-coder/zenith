import ConfigService from '#server/services/config.service.ts'

const config = new ConfigService()

await config.load()

export default config