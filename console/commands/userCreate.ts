import { program } from 'commander'
import { UserRepository } from '../repositories/user.repository.ts'

program.command('user:create')
    .helpGroup('user')
    .description('Create a new user')
    .requiredOption('-n, --name <name>', 'User name')
    .requiredOption('-e, --email <email>', 'User email')
    .requiredOption('-p, --password <password>', 'User password')
    .action(async (options) => {
        const { name, email, password } = options
        const userRepository = new UserRepository()

        // Check if user already exists
        const existingUser = await userRepository.exists(email)
        if (existingUser) {
            console.log(`❌ User with email '${email}' already exists`)
            return
        }

        const userData = {
            username: name,
            email,
            password // Raw password - repository will hash it
        }

        const newUser = await userRepository.create(userData)

        if (!newUser) {
            console.log(`❌ Failed to create user '${name}'`)
            return
        }

        console.log(`✓ User '${name}' created successfully`)
        console.log(`  ID: ${newUser.id}`)
        console.log(`  Username: ${newUser.username}`)
        console.log(`  Email: ${newUser.email}`)
    })
