import BaseException from '#server/exceptions/base.ts'
import root from '#server/facades/router.facade.ts'
import config from '#server/facades/config.facade.ts'
import { $t } from '#shared/lang.ts'
import { basePath } from '#server/utils/paths.ts'
import migrator from '#server/facades/migrator.facade.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import db from '#server/facades/db.facade.ts'
import userRepository from '#server/repositories/user.repository.ts'
import { create } from '#server/queries/index.ts'
import { sql } from 'kysely'

const router = root.prefix('/api/setup').group()

router.post('/database/test', async ({ body }) => {
    const payload = body
    const driver = payload.type
    const options = payload.options || {}

    const connection = db.createConnection(driver, options)

    const [error] = await tryCatch(() => db.createDatabase(connection))

    if (error) {
        throw new BaseException(error.message || $t('Database connection test failed'), 400)
    }

    return { 
        status: 200, 
        success: true, 
        message: $t('Database connection test successful')
    }
})

router.post('/database', async ({ body }) => {
    const payload = body
    const driver = payload.type
    const options = payload.options || {}

    if (config.get('setup.database')) {
        throw new BaseException($t('Database setup already completed'), 400)
    }

    const connection = db.createConnection(driver, options)

    
    config.set('database.connections.default', connection)
    config.set('database.default', 'default')

    const [error] = await tryCatch(async () => {
        await db.load('default')
        await migrator.latestOrFail()
    })

    if (error) {
        console.error(error)
        throw new BaseException($t('Failed to run migrations'), 500)
    }

    config.set('setup.database', true)

    return { status: 200, }
})

router.post('/user', async ({ body }) => {
    const payload = body

    if (config.get('setup.user')) {
        throw new BaseException($t('User setup already completed'), 400)
    }

    if (!payload.username || !payload.email || !payload.password) {
        throw new BaseException($t('Username, Email and password are required'), 400)
    }

    const user = await userRepository.create({
        name: payload.name || '',
        username: payload.username,
        email: payload.email || '',
        password: payload.password // Raw password - repository will hash it
    })

    const permission = await create('permissions', {
        values: {
            action: 'manage',
            subject: 'all',
            conditions: ''
        }
    })

    await create('permissions_assignments', {
        values: {
            permission_id: permission.id,
            assignable_type: 'user',
            assignable_id: user!.id.toString()
        }
    })  

    config.set('setup.user', true)

    return { status: 200, }
})