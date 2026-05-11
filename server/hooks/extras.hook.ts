import { container, EncryptService } from '@sidekick-coder/zenith-kit/server'
import di from '#server/facades/di.facade.ts'
import logger from '#server/facades/logger.facade.ts'
import shell from '#server/facades/shell.facade.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import ConfigService from '#shared/services/config.service.ts'
import env from '#server/facades/env.facade.ts'

export default class ExtrasLifecycleHook extends LifecycleHook {
    public order = 3
    public async onRegister(): Promise<void> {
        const config = di.get<ConfigService>(ConfigService)

        shell.init({
            debug: config.getOne<boolean>(['app.debug', 'shell.debug'], false),
            logger: logger.child({ label: 'shell' }),
        })

        const encrypt = new EncryptService({
            key: config.get('app.key', 'zenith'),
            debug: config.getOne<boolean>(['encrypt.debug', 'app.debug'], false),
            logger: logger.child({ label: 'encrypt' }),
            env: env
        })

        container.set(EncryptService, encrypt)

    }

    public async onLoad(): Promise<void> {
        // const vite = di.get<ViteService>(ViteService)

        // vite.on('vite:client-config', async (opt: ViteServiceEvents['vite:client-config']) => {
        //     opt.config.set('oauth', { google_enabled: config.get('oauth.google_enabled', false), })
        // })
    }
}
