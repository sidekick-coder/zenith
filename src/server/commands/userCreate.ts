import { userRepository } from '@sidekick-coder/zenith-kit/server'
import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'

const command = new CliCommand('user:create')

command
    .need('db', 'hasher')
    .helpGroup('user')
    .description('Create a new user')
    .option('-u, --username <username>', 'User name')
    .option('-e, --email <email>', 'User email')
    .option('-p, --password <password>', 'User password')
    .option('--json', 'Output result as JSON')
    .action(async (options) => {
        const payload = {
            username: options.username,
            email: options.email,
            password: options.password,
            verified_at: new Date().toISOString(),
        }

        if (!payload.username) {
            payload.username = await command.inquirer.input({ message: 'Enter username:', })
        }

        if (!payload.email) {
            payload.email = await command.inquirer.input({ message: 'Enter email:', })
        }

        if (!payload.password) {
            payload.password = await command.inquirer.password({ message: 'Enter password:', })

            const confirmPassword = await command.inquirer.password({ message: 'Confirm password:', })

            if (payload.password !== confirmPassword) {
                console.log('❌ Passwords do not match')
                return
            }
        }

        const user = await userRepository.create(payload)

        if (options.json) {
            console.log(JSON.stringify(user))
            return
        }

        command.object(user)
    })

export default command
