import { basePath, container, emmitter, database, logger, config, MigratorService } from '@sidekick-coder/zenith-kit/server'
import { BaseException, LifecycleHook } from '@sidekick-coder/zenith-kit/shared'

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
                    directory: basePath('server/migrations'),
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
