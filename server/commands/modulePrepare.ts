import { program } from 'commander'
import modules from '#server/services/modules.service.ts'

program.command('module:prepare')
    .helpGroup('module')
    .argument('<module>', 'Module to prepare symlinks for')
    .description('Create symlinks for module (server and shared directories)')
    .action(async (moduleName) => {
        try {
            await modules.prepare(moduleName)
            console.log('✓ Module prepared successfully')
        } catch (error) {
            console.error(`❌ Failed to prepare module: ${error.message}`)
            process.exit(1)
        }
    })
