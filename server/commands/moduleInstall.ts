import { program } from 'commander'
import modules from '#server/facades/modules.facade.ts'
import cli from '#server/services/cli.service.ts'

program.command('module:install')
    .helpGroup('module')
    .argument('<source>', 'GitHub repository or zip file')
    .description('Install a module from a GitHub repository')
    .action(cli.with('config', async (source) => {
        await modules.installer.install(source)
    }))
