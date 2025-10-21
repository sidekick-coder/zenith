import { program } from 'commander'
import chalk from 'chalk'
import migrator from '#server/facades/migrator.facade.ts'
import cli from '#server/services/cli.service.ts'
import db from '#server/facades/db.facade.ts'

program.command('migration:status')
    .helpGroup('migration')
    .option('-m, --module <module>', 'Filter by module')
    .option('-r, --root ', 'Run only root migrations')
    .action(async (options) => {
        await db.load()
        
        const items = await migrator.list(options)

        // sort by root then modules 
        items.sort((a, b) => {
            if (a.module === b.module) {
                return a.name.localeCompare(b.name)
            }

            if (!a.module) return -1
            if (!b.module) return 1

            return a.module.localeCompare(b.module)
        })

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

