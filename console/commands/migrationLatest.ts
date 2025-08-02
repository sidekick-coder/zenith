import { program } from 'commander';
import migrator from '../database/migrator.ts';
import cli from '../services/cli.service.ts';

program.command('migration:latest')
    .helpGroup('migration')
    .description('Run all pending migrations')
    .action(async () => {
        const results = await migrator.latest();

        if (results.length === 0) {
            console.log('No pending migrations');
            return;
        }

        cli.ui.table(results);
    });
