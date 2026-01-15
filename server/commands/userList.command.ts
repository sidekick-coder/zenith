
import { program } from 'commander'
import auth from '#server/facades/auth.facade.ts'
import User from '#server/entities/user.entity.ts'
import { table } from '#server/utils/cliUi.ts'

program.command('user:list')
    .helpGroup('user')
    .option('-l, --limit <limit>', 'Number of users to list', '10')
    .option('-o, --offset <offset>', 'Offset for listing users', '0')
    .action(async (options: any) => {

        const query = User.select().selectAll()

        query.limit(options.limit ? Number(options.limit) : 10)

        if (options.offset) {
            query.offset(Number(options.offset))
        }

        const users = await User.list({
            query: () => query
        })

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