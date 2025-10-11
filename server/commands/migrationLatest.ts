import { program } from 'commander'
import migrator from '#server/facades/migrator.facade.ts'
import cli from '#server/services/cli.service.ts'

program.command('migration:latest')
    .helpGroup('migration')
    .description('Run all pending migrations')
    .option('-m, --module <string>', 'Filter by module name')
    .action(cli.with(['db'], async (options) => {
        const results = await migrator.latest({ module: options.module })

        if (results.length === 0) {
            console.log('No pending migrations')
            return
        }

        cli.ui.table(results)
    }))
