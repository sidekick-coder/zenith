import arte from '#server/facades/arte.facade.ts'
import migrator from '#server/facades/migrator.facade.ts'
import cli from '#server/services/cli.service.ts'

arte
    .command('migration:latest')
    .need('db', 'modules')
    .helpGroup('migration')
    .description('Run all pending migrations')
    .option('-m, --module <string>', 'Filter by module name')
    .option('-r, --root ', 'Run only root migrations')
    .action(cli.with(['db'], async (options) => {
        const results = await migrator.latest({ 
            module: options.module,
            root: !!options.root 
        })

        if (results.length === 0) {
            console.log('No pending migrations')
            return
        }

        arte.table(results)
    }))
