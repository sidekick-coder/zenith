import config from '#server/facades/config.facade.ts'
import emmitter from '#server/facades/emmitter.facade.ts'
import logger from '#server/facades/logger.facade.ts'
import migrator from '#server/facades/migrator.facade.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'

export default class MigratorLifecycleHook extends LifecycleHook {
    public order = 3

    public logger = logger.child({ label: 'migrator' })

    public async onLoad(): Promise<void> {
        if (!config.get('database.migrator.auto', false)) {
            emmitter.emit('migrator:skipped')
            return
        }


        this.logger.info('running pending root migrations...')

        const results = await migrator.latest({ root: true })

        if (!results.length) {
            this.logger.info('no pending migrations')
            return
        }

        for (const result of results) {
            if (result.result === 'failed') {
                this.logger.error(`failed "${result.filename}": ${result.errorMessage}`)
            } else {
                this.logger.info(`migrated "${result.filename}"`)
            }
        }

        if (results.some(r => r.result === 'failed')) {
            throw new Error('one or more migrations failed, aborting startup')
        }

        emmitter.emit('migrator:completed')
    }
}
