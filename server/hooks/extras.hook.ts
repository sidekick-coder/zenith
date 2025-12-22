import di from '#server/facades/di.facade.ts'
import encrypt from '#server/facades/encrypt.facade.ts'
import env from '#server/facades/env.facade.ts'
import logger from '#server/facades/logger.facade.ts'
import shell from '#server/facades/shell.facade.ts'
import type { ConfigLoader } from '#server/services/config.service.ts'
import ConfigFSService from '#server/services/configFS.service.ts'
import ConfigFSLoader from '#server/services/configFS.service.ts'
import DatabaseService from '#server/services/database.service.ts'
import { configPath } from '#server/utils/paths.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import ConfigService from '#shared/services/config.service.ts'

export default class ExtrasLifecycleHook extends LifecycleHook {
    public order = 3
    public async onRegister(): Promise<void> {
        const config = di.get<ConfigService>(ConfigService)

        shell.init({
            debug: config.get('shell.debug', false) || config.get('app.debug', false),
            logger: logger.child({ label: 'shell' }),
        })

        encrypt.load({
            key: config.get('app.key', 'zenith'),
            debug: config.getOne<boolean>(['app.debug', 'encrypt.debug'], false),
        })
    }
}