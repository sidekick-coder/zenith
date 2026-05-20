import { container, EncryptService } from '@sidekick-coder/zenith-kit/server'
import { ConfigService, LifecycleHook } from '@sidekick-coder/zenith-kit/shared'
import logger from '#server/facades/logger.facade.ts'
import env from '#server/facades/env.facade.ts'

export default class extends LifecycleHook {
    public hook_aliases = ['encrypt']

    public async register(): Promise<void> {
        const config = container.get<ConfigService>(ConfigService)

        const encrypt = new EncryptService({
            key: config.get('app.key', 'zenith'),
            debug: config.getOne<boolean>(['encrypt.debug', 'app.debug'], false),
            logger: logger.child({ label: 'encrypt' }),
            env: env
        })

        container.set(EncryptService, encrypt)
    }
}
