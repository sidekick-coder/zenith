import { program } from 'commander';
import migrator from '../database/migrator.ts';
import chalk from 'chalk';
import cli from '../services/cli.service.ts';

program.command('migration:status')
    .action(async () => {
        const items = await migrator.list();

        const data = items.map(item => ({
            status: item.executedAt ? chalk.green('Executed') : chalk.red('Pending'),
            name: item.name,
        }))

        cli.ui.table(data, [
            {
                label: 'status',
                value: 'status',
                width: 15,
            },
            {
                label: 'name',
                value: 'name',
            }
        ])

    });

