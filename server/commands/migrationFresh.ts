import { program } from 'commander'
import migrator from '#server/facades/migrator.facade.ts'
import cli from '#server/services/cli.service.ts'

program.command('migration:fresh')
    .helpGroup('migration')
    .description('Rollback all migrations and re-run them')
    .option('-m, --module <string>', 'Filter by module name')
    .action(cli.with(['db'], async (options: { module?: string }) => {
        const results = await migrator.fresh({
            module: options.module
        })

        if (!results.length) {
            console.log('No migrations to run')
            return
        }

        cli.ui.table(results)
    }))
