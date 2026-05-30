import { userRepository } from '@sidekick-coder/zenith-kit/server'
import type { UserEntity } from '@sidekick-coder/zenith-kit/shared'
import arte from '#server/facades/arte.facade.ts'
import { createUserPermission } from '#server/queries/index.ts'
import cli from '#server/services/cli.service.ts'

arte.command('user:create-permission')
    .need('db')
    .helpGroup('user')
    .description('Create a new user permission')
    .option('-u, --username <username>', 'Username')
    .option('-e, --email <email>', 'Email')
    .requiredOption('-n, --name <name>', 'Permission name')
    .requiredOption('-a, --action <action>', 'Permission action')
    .requiredOption('-s, --subject <subject>', 'Permission subject')
    .option('-c, --conditions <conditions>', 'Permission conditions, as JSON string', '{}')
    .action(async (options) => {
        const { name, subject, action, conditions } = options

        let user: UserEntity | null = null

        if (!options.username) {
            user = await userRepository.findOne({ username: options.username })
        }

        if (!options.email) {
            user = await userRepository.findOne({ email: options.email })
        }

        if (!user) {
            console.error('User not found')
            return
        }

        const { permission } = await createUserPermission(user.id, {
            name,
            action,
            subject,
            conditions: JSON.parse(conditions)
        })

        cli.ui.object(permission)
    })
