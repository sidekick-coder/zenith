import { program } from 'commander';
import migrator from '../database/migrator.ts';
import chalk from 'chalk';
import cli from '../services/cli.service.ts';

program.command('migration:status')
    .helpGroup('migration')
    .action(async () => {
        const items = await migrator.list();

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
        ]);
    });

