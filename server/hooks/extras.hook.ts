import di from '#server/facades/di.facade.ts'
import config from '#server/facades/config.facade.ts'
import emmitter from '#server/facades/emmitter.facade.ts'
import encrypt from '#server/facades/encrypt.facade.ts'
import logger from '#server/facades/logger.facade.ts'
import shell from '#server/facades/shell.facade.ts'
import ViteService from '#server/services/vite.service.ts'
import type { ViteServiceEvents } from '#server/services/vite.service.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import ConfigService from '#shared/services/config.service.ts'

export default class ExtrasLifecycleHook extends LifecycleHook {
    public order = 3
    public async onRegister(): Promise<void> {
        const config = di.get<ConfigService>(ConfigService)

        emmitter.load({
            debug: config.getOne<boolean>(['app.debug', 'emmitter.debug'], false),
        })

        shell.init({
            debug: config.getOne<boolean>(['app.debug', 'shell.debug'], false),
            logger: logger.child({ label: 'shell' }),
        })

        encrypt.load({
            key: config.get('app.key', 'zenith'),
            debug: config.getOne<boolean>(['app.debug', 'encrypt.debug'], false),
        })
    }

    public async onLoad(): Promise<void> {
        const vite = di.get<ViteService>(ViteService)

        vite.on('vite:client-config', async (opt: ViteServiceEvents['vite:client-config']) => {
            opt.config.set('oauth', {
                google_enabled: config.get('oauth.google_enabled', false),
            })
        })
    }
}