import { config, defineHandler, migrator } from '@sidekick-coder/zenith-kit/server'
import { BaseException } from '@sidekick-coder/zenith-kit/shared'
import db from '#server/facades/db.facade.ts'

export default defineHandler( async ({ body }) => {
    const payload = body
    const driver = payload.type
    const options = payload.options || {}

    if (!config.get('setup.need_database')) {
        throw new BaseException($t('Database setup already completed'), 400)
    }

    const connection = db.createConnection(driver, options)

    const database = config.get('database', {
        default: 'default',
        connections: {},
    })

    database.connections['default'] = connection
    
    config.set('database', database)

    db.connections = database.connections
    db.defaultConnection = database.default

    const [error] = await $try(async () => {
        await db.load('default')

        await migrator.latestOrFail({ source: 'root' })
    })

    if (error) {
        throw error
    }

    config.set('setup.need_database', false, 'runtime')

    return { status: 200, }
})
