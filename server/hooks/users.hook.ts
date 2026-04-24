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

    public async onLoad(): Promise<void> {
        await User.boot()

        const [error, count] = (await tryCatch(() => User.count()))

        if (error || !count) {
            config.set('setup.need_users', true, 'runtime')
        }

        if (!config.get('users_auto', false)) {
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
                logger.warn('users hook: skipping user, missing required fields (username, email, password)')
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
                logger.info(`users hook: updated user "${username}"`)
            } else {
                await User.create({
                    id: userConfig.id,
                    username,
                    email,
                    password,
                    name,
                    verified_at: new Date() 
                })
                logger.info(`users hook: created user "${username}"`)
            }

            const permissions: string[] = String(userConfig.permissions || '')
                .split(',')
                .map((p: string) => p.trim())
                .filter(Boolean)

            for (const permission of permissions) {
                const shortcut = PERMISSION_SHORTCUTS[permission]

                if (!shortcut) {
                    logger.warn(`users hook: unknown permission shortcut "${permission}", skipping`)
                    continue
                }

                await createUserPermission(userConfig.id, {
                    action: shortcut.action,
                    subject: shortcut.subject,
                    origin: 'config',
                })

                logger.info(`users hook: assigned permission "${permission}" to user "${username}"`)
            }
        }
    }
}
