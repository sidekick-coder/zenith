import { program } from 'commander'
import migrator from '#server/facades/migrator.facade.ts'
import cli from '#server/services/cli.service.ts'

program.command('migration:up')
    .helpGroup('migration')
    .description('Run pending migrations')
    .option('-s, --step <number>', 'Number of migrations to run', Number)
    .option('-m, --module <string>', 'Filter by module name')
    .option('-r, --root', 'Run migration on root database')
    .action(cli.with(['db'], async (options: { step?: number, module?: string, root?: boolean }) => {
        const results = await migrator.up(options.step, { 
            module: options.module,
            root: !!options.root
        })

        if (results.length === 0) {
            console.log('No pending migrations')
            return
        }

        cli.ui.table(results)
    }))
