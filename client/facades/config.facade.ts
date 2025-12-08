import ConfigService from '#shared/services/config.service.ts'

const config = new ConfigService()

if (import.meta.env.DEV) {
    globalThis.config = config
}

export default config