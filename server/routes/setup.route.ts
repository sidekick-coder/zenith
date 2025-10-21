import BaseException from '#server/exceptions/base.ts'
import root from '#server/facades/router.facade.ts'
import config from '#server/facades/config.facade.ts'
import { $t } from '#shared/lang.ts'
import migrator from '#server/facades/migrator.facade.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import db from '#server/facades/db.facade.ts'
import drive from '#server/facades/drive.facade.ts'
import {  createUser } from '#server/queries/index.ts'
import { createUserPermission } from '#server/queries/createUserPermission.ts'
import { serverPath, generateKey } from '#server/utils/index.ts'

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
        await migrator.latest({ root: true })
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

    const user = await createUser({
        name: payload.name,
        username: payload.username,
        email: payload.email,
        password: payload.password
    })

    await createUserPermission(user.id, {
        action: 'manage',
        subject: 'all'
    })

    drive.createDefaultDrives()

    config.set('setup.user', true)
    config.set('app.key', generateKey(32))

    return { status: 200, }
})