import { program } from 'commander'
import migrator from '#server/database/migrator.ts'
import cli from '#server/services/cli.service.ts'

program.command('migration:down')
    .helpGroup('migration')
    .description('Rollback executed migrations')
    .option('-s, --step <number>', 'Number of migrations to rollback', Number)
    .action(async (options) => {
        const results = await migrator.down(options.step)

        if (results.length === 0) {
            console.log('No migrations to rollback')
            return
        }

        cli.ui.table(results)
    })

