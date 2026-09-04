import { LifecycleHook } from '@sidekick-coder/zenith-kit/shared'
import { database, userRepository } from '@sidekick-coder/zenith-kit/server'
import config from '#server/facades/config.facade.ts'
import logger from '#server/facades/logger.facade.ts'
import { createUserPermission } from '#server/queries/createUserPermission.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

const PERMISSION_SHORTCUTS: Record<string, { action: string; subject: string }> = {
    admin: {
        action: 'manage',
        subject: 'all'
    },
}

export default class UsersLifecycleHook extends LifecycleHook {
    public order = 10

    public logger = logger.child({ label: 'users' })

    public async checkUserCount(): Promise<void> {
        const tables = await database.introspection.getTables()
        const hasUserTable = tables.some(table => table.name === 'users')

        if (!hasUserTable) {
            config.set('setup.need_users', true, 'runtime')
            return
        }

        const [error, count] = await tryCatch(() => userRepository.count())

        if (error) {
            config.set('setup.need_users', true, 'runtime')
            return
        }

        if (!count) {
            config.set('setup.need_users', true, 'runtime')

            this.logger.info('no users found, setup is required')
        }
    }

    public async onLoad(): Promise<void> {
        if (!config.get('users.auto', false)) {
            await this.checkUserCount()
            return
        }

        const configEntries = config.get<any[]>('users.registry', [])

        const userEntries: any[] = []

        configEntries.forEach((entry, id) => {
            userEntries.push({
                id: id,
                ...entry
            })
        })

        if (!userEntries.length) return

        for (const userConfig of userEntries) {
            if (!userConfig) continue

            const username = userConfig.username
            const email = userConfig.email ?? userConfig.admin?.email
            const password = userConfig.password ?? userConfig.admin?.password
            const name = userConfig.name ?? username

            if (!username || !email || !password) {
                this.logger.warn('skipping user, missing required fields (username, email, password)')
                continue
            }

            const existing = await userRepository.findById(userConfig.id)

            if (existing) {
                await userRepository.updateById(userConfig.id, {
                    username,
                    email,
                    password,
                    name
                })
                this.logger.info(`updated user "${username}"`)
            } else {
                await userRepository.create({
                    id: userConfig.id,
                    username,
                    email,
                    password,
                    name,
                    verified_at: new Date().toISOString(),
                })

                this.logger.info(`created user "${username}"`)
            }

            const permissions: string[] = String(userConfig.permissions || '')
                .split(',')
                .map((p: string) => p.trim())
                .filter(Boolean)

            for (const permission of permissions) {
                const shortcut = PERMISSION_SHORTCUTS[permission]

                if (!shortcut) {
                    this.logger.warn(`unknown permission shortcut "${permission}", skipping`)
                    continue
                }

                await createUserPermission(userConfig.id, {
                    action: shortcut.action,
                    subject: shortcut.subject,
                    origin: 'config',
                })

                this.logger.info(`assigned permission "${permission}" to user "${username}"`)
            }

            await this.checkUserCount()
        }
    }
}
