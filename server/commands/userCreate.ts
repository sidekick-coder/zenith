import { program } from 'commander'
import userRepository from '#server/repositories/user.repository.ts'
import cli from '#server/services/cli.service.ts'

program.command('user:create')
    .helpGroup('user')
    .description('Create a new user')
    .requiredOption('-u, --username <username>', 'User name')
    .requiredOption('-e, --email <email>', 'User email')
    .requiredOption('-p, --password <password>', 'User password')
    .option('-s, --skip-if-exists', 'Skip if user already exists')
    .action(cli.with(['db'], async (options) => {
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
            password // Raw password - repository will hash it
        }

        const newUser = await userRepository.create(userData)

        if (!newUser) {
            console.log('❌ Failed to create user')
            return
        }

        console.log(`✓ User '${username}' created successfully`)
        console.log(`  ID: ${newUser.id}`)
        console.log(`  Username: ${newUser.username}`)
        console.log(`  Email: ${newUser.email}`)
    }))
