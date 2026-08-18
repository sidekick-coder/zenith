import arte from '#server/facades/arte.facade.ts'
import cli from '#server/services/cli.service.ts'
import auth from '#server/facades/auth.facade.ts'

arte.command('user:login')
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
        
        cli.ui.object(result)
    })
