import di from '#server/facades/di.facade.ts'
import env from '#server/facades/env.facade.ts'
import logger from '#server/facades/logger.facade.ts'
import type { ConfigLoader } from '#server/services/config.service.ts'
import ConfigFSService from '#server/services/configFS.service.ts'
import ConfigFSLoader from '#server/services/configFS.service.ts'
import DatabaseService from '#server/services/database.service.ts'
import { configPath } from '#server/utils/paths.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import ConfigService from '#shared/services/config.service.ts'

export default class ConfigLifecycleHook extends LifecycleHook {
    public async onRegister(): Promise<void> {
        const service = new ConfigFSService()

        service.init({
            directory: configPath(),
            debug: env.get('CONFIG_DEBUG'),
            logger: logger.child({ label: 'config' }),
        })

        await service.load()

        di.set(ConfigService, service)
    }
}