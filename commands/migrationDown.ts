
import { program } from 'commander';
import migrator from '../database/migrator.ts';
import Table from 'cli-table3';
import chalk from 'chalk';
import dbManager from '../database/manager.ts';

program.command('migration:down')
    .action(async () => {
        await dbManager.load();

        await migrator.up();

        const { error, results }= await migrator.down();

        if (error) {
            console.error(chalk.red('Error during migration:'), error);
            return;
        }

        const table = new Table({
            head: ['Status', 'Migration'],
            colWidths: [10, 50],
            style: {
                head: [],
            }
        })

        results?.forEach(migration => {
            const status = migration.status === 'Success' ? chalk.green('Executed') : chalk.red('Failed');

            table.push([status, migration.migrationName]);
        });


        console.log(table.toString());

    });
