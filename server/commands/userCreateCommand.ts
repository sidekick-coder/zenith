import arte from '#server/facades/arte.facade.ts'
import userRepository from '#server/repositories/user.repository.ts'

arte.command('user:create')
    .need('db')
    .helpGroup('user')
    .description('Create a new user')
    .requiredOption('-u, --username <username>', 'User name')
    .requiredOption('-e, --email <email>', 'User email')
    .requiredOption('-p, --password <password>', 'User password')
    .option('-s, --skip-if-exists', 'Skip if user already exists')
    .option('--json', 'Output result as JSON')
    .action(async (options) => {
        const { username, email, password } = options

        // Check if user already exists
        const existingUser = await userRepository.exists(email)

        if (existingUser && options.skipIfExists) {
            console.log(`⚠️ User with email '${email}' already exists. Skipping creation.`)
            return
        }

        if (existingUser) {
            throw new Error(`User with email '${email}' already exists.`)
        }

        const userData = {
            name: username,
            username,
            email,
            password, // Raw password
            verified_at: new Date(), // Mark as verified by default for CLI-created users
        }

        const newUser = await userRepository.create(userData)

        if (!newUser) {
            console.log('❌ Failed to create user')
            return
        }

        if (options.json) {
            console.log(JSON.stringify({
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
            }))
            return
        }

        console.log(`✓ User '${username}' created successfully`)
        console.log(`  ID: ${newUser.id}`)
        console.log(`  Username: ${newUser.username}`)
        console.log(`  Email: ${newUser.email}`)
    })
