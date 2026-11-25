import { CliCommand, auth } from '@sidekick-coder/zenith-kit/server'

const command = new CliCommand('user:login')
    .need('db')
    .helpGroup('user')
    .description('Login a user and return a token')
    .requiredOption('-u, --uuid <uuid>', 'Email or username')
    .requiredOption('-p, --password <password>', 'User password')
    .action(async (options: { uuid: string, password: string }) => {
        const { uuid, password } = options

        const result = await auth.login({ 
            uuid,
            password
        })

        if (!result.success) {
            console.log('❌ Login failed:', result.message)
            return
        }
        
        command.object(result)
    })

export default command
