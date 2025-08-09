import { program } from 'commander'
import chalk from 'chalk'
import migrator from '#server/database/migrator.ts'
import cli from '#server/services/cli.service.ts'
import db from '#server/facades/db.facade.ts'

program.command('migration:status')
    .helpGroup('migration')
    .action(async () => {
        await db.load()
        const items = await migrator.list()

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
    })

