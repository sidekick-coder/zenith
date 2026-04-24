import config from '#server/facades/config.facade.ts'
import logger from '#server/facades/logger.facade.ts'
import User from '#server/entities/user.entity.ts'
import { createUserPermission } from '#server/queries/createUserPermission.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
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
        const [error, count] = (await tryCatch(() => User.count()))

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
        await User.boot()

        if (!config.get('users_auto', false)) {
            await this.checkUserCount()
            return
        }

        const userEntries: any[] = []

        for (const [key, entry] of config.entries.entries()) {
            const match = key.match(/^users\[(\d+)\]$/)

            if (match) {
                userEntries.push({
                    id: Number(match[1]),
                    ...entry.value 
                })
            }
        }

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

            const existing = await User.find(userConfig.id)

            if (existing) {
                await User.updateById(userConfig.id, {
                    username,
                    email,
                    password,
                    name 
                })
                this.logger.info(`updated user "${username}"`)
            } else {
                await User.create({
                    id: userConfig.id,
                    username,
                    email,
                    password,
                    name,
                    verified_at: new Date() 
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
