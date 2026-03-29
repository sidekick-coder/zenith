import { password as passwordPrompt } from '@inquirer/prompts'
import arte from '#server/facades/arte.facade.ts'
import User from '#server/entities/user.entity.ts'

arte.command('user:password')
    .need('db')
    .helpGroup('user')
    .description('Update user password')
    .requiredOption('-u, --uuid <uuid>', 'Email or username')
    .action(async (options: { uuid: string, password: string }) => {
        const { uuid } = options

        const user = await User.findByUUID(uuid)

        if (!user) {
            console.log('❌ User not found')
            return
        }

        const password = await passwordPrompt({ message: `Enter new password for user '${user.username}':`, })

        const confirmPassword = await passwordPrompt({ message: 'Confirm new password:', })

        if (password !== confirmPassword) {
            console.log('❌ Passwords do not match')
            return
        }

        await User.updateById(user.id, { password })

        console.log(`✓ Password updated successfully for user '${user.username}'`)
    })
