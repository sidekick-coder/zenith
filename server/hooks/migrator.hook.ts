import config from '#server/facades/config.facade.ts'
import logger from '#server/facades/logger.facade.ts'
import migrator from '#server/facades/migrator.facade.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'

export default class MigratorLifecycleHook extends LifecycleHook {
    public order = 3

    public async onLoad(): Promise<void> {
        if (!config.get('migrator.auto', false)) return

        logger.info('migrator hook: running pending root migrations...')

        const results = await migrator.latest({ root: true })

        if (!results.length) {
            logger.info('migrator hook: no pending migrations')
            return
        }

        for (const result of results) {
            if (result.result === 'failed') {
                logger.error(`migrator hook: failed to run migration "${result.filename}": ${result.errorMessage}`)
            } else {
                logger.info(`migrator hook: ran migration "${result.filename}"`)
            }
        }

        if (results.some(r => r.result === 'failed')) {
            throw new Error('migrator hook: one or more migrations failed, aborting startup')
        }
    }
}
