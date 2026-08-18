import modules from '#server/facades/modules.facade.ts'
import arte from '#server/facades/arte.facade.ts'

arte
    .command('module:uninstall')
    .need('modules')
    .helpGroup('module')
    .description('Uninstall a module')
    .requiredOption('-m, --module <name>', 'Module name to uninstall')
    .action(async (options) => {        
        const name = options.module 

        await modules.uninstall(name)
    })
