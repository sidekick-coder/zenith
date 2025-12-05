import { program } from 'commander'
import modules from '#server/facades/modules.facade.ts'

program.command('module:prepare')
    .helpGroup('module')
    .argument('<module>', 'Module to prepare symlinks for')
    .description('Create symlinks for module (server and shared directories)')
    .action(async (moduleName) => {
        await modules.prepare(moduleName)
    })
