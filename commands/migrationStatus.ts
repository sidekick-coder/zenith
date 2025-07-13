import { program } from 'commander';
import migrator from '../database/migrator.ts';
import dbManager from '../database/manager.ts';
import Table from 'cli-table3';
import chalk from 'chalk';

program.command('migration:status')
    .action(async () => {
        await dbManager.load();

        const migrations = await migrator.list();

        const table = new Table({
            head: ['Status', 'Migration'],
            colWidths: [10, 50],
            style: {
                head: [],
            }
        })

        migrations.forEach(migration => {
            const status = migration.executedAt ? chalk.green('Executed') : chalk.red('Pending');

            table.push([status, migration.name]);
        });


        console.log(table.toString());

    });
