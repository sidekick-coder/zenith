import { config, defineHandler, drive, database, UserRepository } from '@sidekick-coder/zenith-kit/server'
import { BaseException } from '@sidekick-coder/zenith-kit/shared'
import { createUserPermission } from '#server/queries/createUserPermission.ts'
import { generateKey } from '#server/utils/generateKey.ts'
import server from '#server/facades/server.facade.ts'

export default defineHandler(async ({ body }) => {
    const payload = body
    const userRepository = new UserRepository(database)

    if (config.get('setup.user')) {
        throw new BaseException($t('User setup already completed'), 400)
    }

    if (!payload.username || !payload.email || !payload.password) {
        throw new BaseException($t('Username, Email and password are required'), 400)
    }

    const user = await userRepository.create({
        name: payload.name,
        username: payload.username,
        email: payload.email,
        password: payload.password,
        verified_at: new Date().toISOString(),
    })

    await createUserPermission(user.id, {
        action: 'manage',
        subject: 'all'
    })

    drive.createDefaultDrives()

    config.set('app.key', generateKey(32))
    config.set('setup.need_users', false, 'runtime')

    // reload server 
    setTimeout(() => server.reload(), 2000)

    return { status: 200, }
})
