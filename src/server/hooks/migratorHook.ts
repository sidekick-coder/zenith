import { serverPath } from '@sidekick-coder/zenith-kit/server/utils/basePath'
import container from '@sidekick-coder/zenith-kit/server/facades/container'
import emmitter from '@sidekick-coder/zenith-kit/server/facades/emmitter'
import database from '@sidekick-coder/zenith-kit/server/facades/database'
import logger from '@sidekick-coder/zenith-kit/server/facades/logger'
import config from '@sidekick-coder/zenith-kit/server/facades/config'
import MigratorService from '@sidekick-coder/zenith-kit/server/services/MigratorService'
import BaseException from '@sidekick-coder/zenith-kit/shared/exceptions/BaseException'
import LifecycleHook from '@sidekick-coder/zenith-kit/shared/entities/LifecycleHook'

export default class extends LifecycleHook {
    public order = 3
    public hook_aliases = ['migrator']

    public async register(){

        const migrator = new MigratorService({
            logger: logger.child({ label: 'migrator' }),
            emmitter: emmitter,
            db: database as any,
            sources: [
                {
                    id: 'root',
                    directory: serverPath('migrations'),
                }
            ]
        })

        container.set(MigratorService, migrator)

        await emmitter.emitAndWait('migrator:registered', { migrator })
    }

    public async load(): Promise<void> {
        if (!config.get('database.migrator.auto', false)) {
            emmitter.emit('migrator:skipped')
            return
        }

        const migrator = container.get<MigratorService>(MigratorService)

        migrator.logger.info('running pending root migrations...')

        const results = await migrator.latest({ source: 'root', })

        if (!results.length) {
            migrator.logger.info('no pending migrations')
            return
        }

        for (const result of results) {
            if (result.result === 'failed') {
                migrator.logger.error(result.error.message, result.error)
                continue
            } 

            migrator.logger.info(`migrated "${result.filename}"`)
        }

        if (results.some(r => r.result === 'failed')) {
            throw new BaseException('one or more migrations failed, aborting startup')
        }

        emmitter.emit('migrator:completed')
    }
}
