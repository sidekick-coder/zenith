import { program } from 'commander'
import migrator from '#server/facades/migrator.facade.ts'
import cli from '#server/services/cli.service.ts'

program.command('migration:rollback')
    .helpGroup('migration')
    .description('Rollback executed migrations')
    .option('-m, --module <string>', 'Filter by module name')
    .action(cli.with(['db'], async (options: { module?: string }) => {
        const results = await migrator.rollback({
            module: options.module
        })

        cli.ui.table(results)
    }))
