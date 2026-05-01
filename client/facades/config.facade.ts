import { container } from '@sidekick-coder/zenith-kit/client'
import ConfigService from '#shared/services/config.service.ts'

const config = container.proxy<ConfigService>(ConfigService)

if (import.meta.env.DEV) {
    globalThis.config = config
}

export default config
