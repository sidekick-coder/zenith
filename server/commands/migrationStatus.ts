import { program } from 'commander'
import chalk from 'chalk'
import migrator from '#server/facades/migrator.facade.ts'
import cli from '#server/services/cli.service.ts'
import db from '#server/facades/db.facade.ts'

program.command('migration:status')
    .helpGroup('migration')
    .option('-m, --module <module>', 'Filter by module')
    .action(async (options) => {
        await db.load()
        
        let items = await migrator.list()

        if (options.module) {
            items = items.filter(i => i.module === options.module)
        }

        cli.ui.table(items, [
            {
                label: 'status',
                value: i => i.executedAt ? chalk.green('Executed') : chalk.red('Pending'),
                width: 20,
            },
            {
                label: 'module',
                value: 'module',
                width: 20,
            },
            {
                label: 'name',
                value: 'name',
            }
        ])

        await db.destroy()
    })

