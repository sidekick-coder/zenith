import migrator from '#server/facades/migrator.facade.ts'
import arte from '#server/facades/arte.facade.ts'

arte.command('migration:up')
    .need('db', 'modules')
    .helpGroup('migration')
    .description('Run pending migrations')
    .option('-s, --step <number>', 'Number of migrations to run', Number)
    .option('-m, --module <string>', 'Filter by module name')
    .option('-r, --root', 'Run migration on root database')
    .action(async (options: { step?: number, module?: string, root?: boolean }) => {
        const results = await migrator.up(options.step, { 
            module: options.module,
            root: !!options.root
        })

        if (results.length === 0) {
            console.log('No pending migrations')
            return
        }

        arte.table(results)
    })
