import container from '@sidekick-coder/zenith-kit/server/facades/container'
import EncryptService from '@sidekick-coder/zenith-kit/server/services/EncryptService'
import ConfigService from '@sidekick-coder/zenith-kit/shared/services/ConfigService'
import LifecycleHook from '@sidekick-coder/zenith-kit/shared/entities/LifecycleHook'
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
