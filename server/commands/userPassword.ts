import { program } from 'commander'
import { password as passwordPrompt } from '@inquirer/prompts'
import cli from '#server/services/cli.service.ts'
import auth from '#server/facades/auth.facade.ts'
import User from '#server/entities/user.entity.ts'

program.command('user:password')
    .helpGroup('user')
    .description('Update user password')
    .requiredOption('-u, --uuid <uuid>', 'Email or username')
    .action(cli.with(['db'], async (options: { uuid: string, password: string }) => {
        const { uuid } = options

        const user = await User.findByUUID(uuid)

        if (!user) {
            console.log('❌ User not found')
            return
        }

        const password = await passwordPrompt({
            message: `Enter new password for user '${user.username}':`,
        })

        const confirmPassword = await passwordPrompt({
            message: 'Confirm new password:',
        })

        if (password !== confirmPassword) {
            console.log('❌ Passwords do not match')
            return
        }

        await User.updateById(user.id, { password })

        console.log(`✓ Password updated successfully for user '${user.username}'`)
    }))
