import { program } from 'commander'
import migrator from '#server/facades/migrator.facade.ts'
import cli from '#server/services/cli.service.ts'

program.command('migration:fresh')
    .helpGroup('migration')
    .description('Rollback all migrations and re-run them')
    .option('-m, --module <string>', 'Filter by module name')
    .option('-r, --root', 'Run migrations only for the root application')
    .action(cli.with(['db'], async (options: { module?: string, root?: boolean }) => {
        const results = await migrator.fresh({
            module: options.module,
            root: !!options.root
        })

        if (!results.length) {
            console.log('No migrations to run')
            return
        }

        cli.ui.table(results)
    }))
