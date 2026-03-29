import modules from '#server/facades/modules.facade.ts'
import arte from '#server/facades/arte.facade.ts'

arte
    .command('module:install')
    .need('modules')
    .helpGroup('module')
    .argument('<source>', 'GitHub repository or zip file')
    .description('Install a module from a GitHub repository')
    .action(async (source) => {
        await modules.installer.install(source)
    })
