import BaseException from '#exceptions/base.ts'
import router from '#facades/router.ts'
import config from '#services/config.service.ts'
import { $t } from '#common/lang.ts'
import { basePath } from '#utils/paths.ts'
import migrator from '#database/migrator.ts'
import { tryCatch } from '#common/tryCatch.ts'
import db from '#facades/db.ts'
import userRepository from '#repositories/user.repository.ts'

router.post('/setup/database', async ({ body }) => {
    const payload = body
    const driver = payload.type
    const options = payload.options || {}

    if (config.get('setup.database')) {
        throw new BaseException($t('Database setup already completed'), 400)
    }

    const connection: any = { driver }

    if (driver === 'sqlite') {
        let database = options.database || 'storage/database.sqlite'

        database = database.startsWith('/') ? database : basePath(database)

        connection.database = database
    }

    config.set('database', {
        default: 'default',
        connections: { default: connection }
    })

    

    const [error] = await tryCatch(async () => {
        await db.load('default')
        await migrator.latestOrFail()
    })

    if (error) {
        config.set('database', null)
        throw new BaseException($t('Failed to run migrations'), 500)
    }

    config.set('setup.database', true)

    return { status: 200, }
})

router.post('/setup/user', async ({ body }) => {
    const payload = body

    if (config.get('setup.user')) {
        throw new BaseException($t('User setup already completed'), 400)
    }

    if (!payload.username || !payload.email || !payload.password) {
        throw new BaseException($t('Username, Email and password are required'), 400)
    }

    const [error] = await tryCatch(async () => {
        return userRepository.create({
            name: payload.name || '',
            username: payload.username,
            email: payload.email || '',
            password: payload.password // Raw password - repository will hash it
        })
    })

    if (error) {
        throw BaseException.fromError(error)
    }

    config.set('setup.user', true)

    return { status: 200, }
})