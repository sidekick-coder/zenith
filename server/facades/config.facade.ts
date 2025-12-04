import ConfigService from '#server/services/config.service.ts'

const config = new ConfigService()

config.loadSync()

config.debug = config.getOne<boolean>(['app.debug', 'config.debug'], false)

export default config