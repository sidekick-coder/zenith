
import { validator } from '@sidekick-coder/zenith-kit/shared'
import { userRepository } from '@sidekick-coder/zenith-kit/server'
import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'
import { table } from '#server/utils/cliUi.ts'

const command = new CliCommand('user:list')
    .helpGroup('user')
    .option('-l, --limit <limit>', 'Number of users to list', '10')
    .option('-o, --offset <offset>', 'Offset for listing users', '0')
    .action(async (options: any) => {

        const payload = validator.validate(options, v => v.object({
            limit: v.optional(v.extras.url.number(), 10),
            offset: v.optional(v.extras.url.number())
        }))

        const users = await userRepository.findMany(payload)

        if (!users.length) {
            console.log('No users found.')
            return
        }

        table(users, [
            {
                label: 'ID',
                value: 'id'
            },
            {
                label: 'Username',
                value: 'username'
            },
            {
                label: 'Email',
                value: 'email'
            },
            {
                label: 'Created At',
                value: 'createdAt'
            }
        ])
    })

export default command
