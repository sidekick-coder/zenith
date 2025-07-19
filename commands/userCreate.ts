import { program } from 'commander'
import { createHash } from 'crypto'
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

        // Hash the password using SHA-256
        const hashedPassword = createHash('sha256').update(password).digest('hex')

        const userData = {
            username: name,
            email,
            password: hashedPassword
        }

        const newUser = await userRepository.create(userData)

        if (newUser) {
            console.log(`✓ User '${name}' created successfully`)
            console.log(`  ID: ${newUser.id}`)
            console.log(`  Username: ${newUser.username}`)
            console.log(`  Email: ${newUser.email}`)
        }
        
        if (!newUser) {
            console.log(`❌ Failed to create user '${name}'`)
        }
    })
