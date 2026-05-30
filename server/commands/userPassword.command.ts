import { password as passwordPrompt } from '@inquirer/prompts'
import type { UserEntity } from '@sidekick-coder/zenith-kit/shared'
import { userRepository } from '@sidekick-coder/zenith-kit/server'
import arte from '#server/facades/arte.facade.ts'

arte.command('user:password')
    .need('db')
    .helpGroup('user')
    .description('Update user password')
    .option('-i, --id <id>', 'user id')
    .option('-u, --username <username>', 'username')
    .option('-e, --email <email>', 'email')
    .action(async (options: any) => {

        let user: UserEntity | null = null

        if (options.id) {
            user = await userRepository.findByIdOrFail(options.id)
        }

        if (options.username) {
            user = await userRepository.findOne({ username: options.username })
        }

        if (options.email) {
            user = await userRepository.findOne({ email: options.email })
        }

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

        await userRepository.updateById(user.id, { password })

        console.log(`✓ Password updated successfully for user '${user.username}'`)
    })
