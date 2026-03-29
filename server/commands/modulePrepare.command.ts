import modules from '#server/facades/modules.facade.ts'
import arte from '#server/facades/arte.facade.ts'

arte
    .command('module:prepare')
    .need('modules')
    .helpGroup('module')
    .requiredOption('-m, --module <name>', 'Module name to prepare')
    .description('Create symlinks for module (server and shared directories)')
    .action(async (options) => {
        await modules.prepare(options.module)
    })
