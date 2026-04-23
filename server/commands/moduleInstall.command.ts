import modules from '#server/facades/modules.facade.ts'
import arte from '#server/facades/arte.facade.ts'

arte
    .command('module:install')
    .need('modules')
    .helpGroup('module')
    .argument('<repository>', 'Git repository URL')
    .description('Install a module from a Git repository')
    .action(async (repository: string) => {
        const path = await import('path')
        const id = path.basename(repository, '.git')

        await modules.installer.install({
            id,
            repository 
        })
    })
